interface RequestBody {
  action: 'generateCharacter' | 'polishDialog' | 'generateAtmosphere' | 'suggestConflict' | 'suggestPlot';
  apiKey: string;
  provider: 'deepseek' | 'openai' | 'qwen';
  params: Record<string, unknown>;
}

const ENDPOINTS: Record<string, string> = {
  deepseek: 'https://api.deepseek.com/v1/chat/completions',
  openai: 'https://api.openai.com/v1/chat/completions',
  qwen: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
};

const MODELS: Record<string, string> = {
  deepseek: 'deepseek-chat',
  openai: 'gpt-4o-mini',
  qwen: 'qwen-plus',
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

function buildPrompt(action: string, params: Record<string, unknown>): { system: string; user: string } {
  switch (action) {
    case 'generateCharacter': {
      const p = params as { name: string; age: number; gender: string; occupation: string; personality: string };
      return {
        system: '你是一位专业剧本角色设计师。请仅输出一个JSON对象：{"backstory":"角色前史，约100字","motivation":"核心动机，约50字","arc":"人物弧光变化，约50字","catchphrase":"标志性口头禅，10字以内"}',
        user: `姓名：${p.name}\n年龄：${p.age}\n性别：${p.gender}\n职业：${p.occupation}\n性格：${p.personality}`,
      };
    }
    case 'polishDialog': {
      const p = params as { text: string; style: string };
      const styles: Record<string, string> = {
        humorous: '诙谐幽默，带点俏皮和机智',
        subtle: '含蓄内敛，话中有话，留白意味深长',
        powerful: '爆发力强，情感充沛，掷地有声',
        professional: '用专业术语替代日常表达，严谨正式',
      };
      const styleDesc = styles[p.style] || '更自然流畅';
      return {
        system: `你是剧本台词润色专家。请将以下台词改写为${styleDesc}的风格。只输出改写后的台词文本，不要加引号、标记或解释。`,
        user: p.text,
      };
    }
    case 'generateAtmosphere': {
      const p = params as { keywords: string[] };
      return {
        system: '你是影视场景氛围设计师。根据关键词生成环境描写。请仅输出一个JSON对象：{"description":"环境描写80-120字，有镜头感，像电影画面","visualMetaphor":"视觉隐喻，15字以内"}',
        user: `场景关键词：${p.keywords.join('、')}`,
      };
    }
    case 'suggestConflict': {
      const p = params as { characters: Array<{ name: string; relationship: string }> };
      const chars = p.characters.map((c: { name: string; relationship: string }) => `${c.name}(${c.relationship})`).join('、');
      return {
        system: '你是剧本冲突设计师。根据角色关系设计冲突。请仅输出一个JSON对象：{"conflicts":["冲突1","冲突2","冲突3"],"escalationPath":["萌芽阶段","逐步升级","冲突爆发","终局对决"]}',
        user: `角色关系：${chars}`,
      };
    }
    case 'suggestPlot': {
      const p = params as { genre: string; currentPlot: string };
      return {
        system: '你是剧本情节顾问。请推荐三种截然不同的剧情发展可能性。请仅输出一个JSON数组：[{"type":"surprise","title":"","description":""},{"type":"emotional","title":"","description":""},{"type":"reveal","title":"","description":""}]。每条description约40字。不要输出其他内容。',
        user: `类型：${p.genre}\n当前剧情：${p.currentPlot || '暂无'}`,
      };
    }
    default:
      return { system: '', user: '' };
  }
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (request.method === 'GET') {
    return json({ ok: true, message: '墨韵 AI API is running', version: '1.0.0' });
  }

  if (request.method !== 'POST') {
    return json({ error: '仅支持 POST 请求' }, 405);
  }

  let body: RequestBody;
  try {
    body = await request.json();
  } catch {
    return json({ error: '请求体格式错误，需要 JSON' }, 400);
  }

  const { action, apiKey, provider = 'deepseek', params } = body;

  if (!apiKey) {
    return json({ error: '请先在设置页面配置您的 API Key' }, 400);
  }

  if (!action || !params) {
    return json({ error: '缺少必要参数 action 或 params' }, 400);
  }

  const endpoint = ENDPOINTS[provider] || ENDPOINTS.deepseek;
  const model = MODELS[provider] || MODELS.deepseek;
  const prompts = buildPrompt(action, params);

  if (!prompts.system) {
    return json({ error: `不支持的 action: ${action}` }, 400);
  }

  try {
    const payload: Record<string, unknown> = {
      model,
      messages: [
        { role: 'system', content: prompts.system },
        { role: 'user', content: prompts.user },
      ],
      temperature: 0.8,
      max_tokens: 1500,
    };

    const aiResponse = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    const responseText = await aiResponse.text();

    if (!aiResponse.ok) {
      let errMsg = `API 请求失败 (${aiResponse.status})`;
      try {
        const errData = JSON.parse(responseText);
        errMsg = errData?.error?.message || errData?.message || errMsg;
      } catch {
        errMsg = responseText.slice(0, 200) || errMsg;
      }
      return json({ error: errMsg }, aiResponse.status);
    }

    if (!responseText.trim()) {
      return json({ error: '大模型返回了空内容，请重试' }, 502);
    }

    let parsed: { choices?: Array<{ message?: { content?: string } }> };
    try {
      parsed = JSON.parse(responseText);
    } catch {
      return json({ error: '解析大模型返回内容失败' }, 502);
    }

    const content = parsed?.choices?.[0]?.message?.content || '';
    if (!content) {
      return json({ error: '大模型未返回有效内容' }, 502);
    }

    let result: unknown;
    const isJsonAction = action !== 'polishDialog';
    if (isJsonAction) {
      try {
        let jsonStr = content.trim();
        const jsonStart = jsonStr.indexOf('{');
        const arrStart = jsonStr.indexOf('[');
        if (jsonStart !== -1 && (arrStart === -1 || jsonStart < arrStart)) {
          jsonStr = jsonStr.slice(jsonStart);
        } else if (arrStart !== -1) {
          jsonStr = jsonStr.slice(arrStart);
        }
        result = JSON.parse(jsonStr);
      } catch {
        result = { raw: content };
      }
    } else {
      result = { rewrittenText: content.replace(/^["']|["']$/g, '').trim() };
    }

    return json({ success: true, data: result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '未知错误';
    return json({ error: `服务异常：${message}` }, 500);
  }
}
