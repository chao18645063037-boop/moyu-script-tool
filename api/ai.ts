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

const JSON_ACTIONS = ['generateCharacter', 'generateAtmosphere', 'suggestConflict', 'suggestPlot'];

function buildPrompt(action: string, params: Record<string, unknown>): { system: string; user: string } {
  switch (action) {
    case 'generateCharacter': {
      const p = params as { name: string; age: number; gender: string; occupation: string; personality: string };
      return {
        system: '你是一位专业剧本角色设计师。请以JSON格式创建角色小传，仅返回JSON：{"backstory":"前史100字","motivation":"动机50字","arc":"弧光变化50字","catchphrase":"口头禅10字内"}',
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
        system: `你是剧本台词润色专家。将台词改写为${styleDesc}的风格。仅返回改写后的台词，不加引号或解释。`,
        user: p.text,
      };
    }
    case 'generateAtmosphere': {
      const p = params as { keywords: string[] };
      return {
        system: '你是影视场景氛围设计师。根据关键词生成环境描写。仅返回JSON：{"description":"环境描写80-120字，有镜头感","visualMetaphor":"视觉隐喻15字内"}',
        user: `场景关键词：${p.keywords.join('、')}`,
      };
    }
    case 'suggestConflict': {
      const p = params as { characters: Array<{ name: string; relationship: string }> };
      const chars = p.characters.map((c: { name: string; relationship: string }) => `${c.name}(${c.relationship})`).join('、');
      return {
        system: '你是剧本冲突设计师。根据角色关系生成冲突。仅返回JSON：{"conflicts":["冲突1","冲突2","冲突3"],"escalationPath":["萌芽","升级","爆发","终局"]}',
        user: `角色关系：${chars}`,
      };
    }
    case 'suggestPlot': {
      const p = params as { genre: string; currentPlot: string };
      return {
        system: '你是剧本情节顾问。推荐意外干扰、情感爆发、秘密揭露三种走向。仅返回JSON数组：[{"type":"surprise","title":"","description":""},{"type":"emotional","title":"","description":""},{"type":"reveal","title":"","description":""}]，每条描述40字内。',
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
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: '仅支持 POST 请求' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }

  try {
    const body: RequestBody = await request.json();
    const { action, apiKey, provider = 'deepseek', params } = body;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: '请先在设置页面配置您的 API Key' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    const endpoint = ENDPOINTS[provider] || ENDPOINTS.deepseek;
    const model = MODELS[provider] || MODELS.deepseek;
    const prompts = buildPrompt(action, params);

    const payload: Record<string, unknown> = {
      model,
      messages: [
        { role: 'system', content: prompts.system },
        { role: 'user', content: prompts.user },
      ],
      temperature: 0.8,
      max_tokens: 1200,
    };

    if (JSON_ACTIONS.includes(action)) {
      payload.response_format = { type: 'json_object' };
    }

    const aiResponse = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!aiResponse.ok) {
      const errData = await aiResponse.json().catch(() => ({}));
      const errMsg = (errData as { error?: { message?: string } })?.error?.message
        || `API 请求失败 (${aiResponse.status})`;
      return new Response(JSON.stringify({ error: errMsg }), {
        status: aiResponse.status,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    const data = await aiResponse.json() as { choices: Array<{ message: { content: string } }> };
    const content = data.choices?.[0]?.message?.content || '';

    let result: unknown;
    if (JSON_ACTIONS.includes(action)) {
      try {
        result = JSON.parse(content);
      } catch {
        result = { raw: content };
      }
    } else {
      result = { rewrittenText: content.trim() };
    }

    return new Response(JSON.stringify({ success: true, data: result }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '未知错误';
    return new Response(JSON.stringify({ error: `服务器错误：${message}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
}
