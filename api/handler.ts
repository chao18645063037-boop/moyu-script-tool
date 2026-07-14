export interface RequestBody {
  action: 'generateCharacter' | 'polishDialog' | 'generateAtmosphere' | 'suggestConflict' | 'suggestPlot'
    | 'generateOutline' | 'generateSceneContent' | 'expandScene' | 'generateDialogue';
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

function buildPrompt(action: string, params: Record<string, unknown>): { system: string; user: string } {
  switch (action) {
    case 'generateCharacter': {
      const p = params as { name: string; age: number; gender: string; occupation: string; personality: string; genre?: string };
      const g = p.genre || '当代现实';
      return {
        system: `你是一位在好莱坞和国内一线编剧团队工作过15年的角色设计师。你设计的角色必须是有血有肉的活人，不是AI捏造的塑料人偶。

创作原则：
1. 前史必须包含具体的、可感知的生活细节（不是概括性的「经历过挫折」），要写出某个改变命运的具体事件
2. 动机必须是自私的、人性化的、有时甚至是矛盾的（不要写「热爱XX事业」「证明自己」这类模板回答）
3. 人物弧光要具体可感：从什么状态变成什么状态，中间的关键转折点是什么
4. 口头禅必须自然口语化，像真人在特定情绪下脱口而出的话，不能是鸡汤/励志型

请仅输出一个JSON对象，不要有任何多余文字：
{"backstory":"具体的前史事件，120-150字","motivation":"真实的、可能自私的动机，50-80字","arc":"从A到B的具体变化过程，50-80字","catchphrase":"自然的口头禅，5-10字"}`,
        user: `请为以下角色设计小传：
姓名：${p.name}
年龄：${p.age}岁
性别：${p.gender}
职业：${p.occupation}
表面性格：${p.personality}
故事类型：${g}

注意：角色的前史中要包含一个具体的、改变过TA人生方向的事件。动机要有阴暗面或者自私成分——真实的人不是圣人。`,
      };
    }

    case 'polishDialog': {
      const p = params as { text: string; style: string; characterName?: string; personality?: string };
      const styles: Record<string, string> = {
        humorous: '带幽默感的，有俏皮和自嘲，让人会心一笑但不尬',
        subtle: '含而不露的，像日常聊天中的弦外之音，字少意多',
        powerful: '有爆发力的，但情绪有层次，不是从头吼到尾',
        professional: '职业化的，用行话和术语替代日常表达',
      };
      const styleDesc = styles[p.style] || '自然口语化';
      const charHint = p.characterName ? `\n角色：${p.characterName}（性格：${p.personality || '中性'}）` : '';
      return {
        system: `你是一位专注台词写作20年的编剧。你的工作是让台词听起来像是真实的人物在说话，而不是演员在念稿子。

改写原则：
1. 口语化：真人不说完美的句子。允许短暂停顿、句子断裂、话题跳跃
2. 潜台词：台词下面有没说出来的意思。观众能感受到弦外之音
3. 节奏感：长短句交替，有停顿。想想这段话说出来需要几秒
4. 个性化：每个人的说话方式不同——用词习惯、句子长度、喜欢用的语气词
5. 删掉多余的「我」「你」：中文口语很多可以省略主语

改写要求：
- 将以下台词改写为「${styleDesc}」的风格
- 保持原意不变，但让表达更自然
- 只输出改写后的台词，不要加任何引号、标记、解释`,
        user: `原文：${p.text}${charHint}`,
      };
    }

    case 'generateAtmosphere': {
      const p = params as { keywords: string[] };
      return {
        system: `你是影视美术指导兼氛围设计师，擅长用文字构建沉浸式的场景感。

写作原则：
1. 用具体的感官细节（视觉、听觉、嗅觉、触觉），而不是抽象形容词
2. 镜头语言：像摄影机在移动——远景→中景→特写，或跟随人物视线
3. 氛围是通过细节暗示的，不要直接说「这里很恐怖」，而要描述「墙上的水渍像一张扭曲的脸」
4. 用动词和名词，少用形容词。让读者自己感受

请仅输出一个JSON对象：
{"description":"场景环境描写，80-150字，有镜头感和感官细节","visualMetaphor":"一句充满画面感的比喻，15字以内"}`,
        user: `场景关键元素：${p.keywords.join('、')}`,
      };
    }

    case 'suggestConflict': {
      const p = params as { characters: Array<{ name: string; relationship: string }> };
      const chars = p.characters.map((c: { name: string; relationship: string }) => `${c.name}(${c.relationship})`).join('、');
      return {
        system: `你是剧本冲突设计专家。好的戏剧冲突不是两个人吵架，而是在特定情境下，人物因为各自的欲望、恐惧、价值观而做出的不可调和的行动选择。

设计原则：
1. 冲突源于人物的内在动机，不是情节需要
2. 好的冲突不可调和——双方都有道理，谁都觉得自己是对的
3. 冲突需要升级路径：从小摩擦到不可收拾

请仅输出一个JSON对象：
{"conflicts":["冲突1：具体的不可调和的对立","冲突2","冲突3"],"escalationPath":["阶段1：微妙的张力","阶段2：公开对峙","阶段3：关系破裂","阶段4：终极抉择"]}`,
        user: `角色关系：${chars}`,
      };
    }

    case 'generateOutline': {
      const p = params as { title: string; genre: string; structure: string; premise?: string };
      const structurePrompts: Record<string, string> = {
        three_act: '三幕式结构。第一幕（铺垫，占总篇幅25%）：建立世界和人物，引入核心冲突。第二幕（对抗，50%）：冲突升级，主角不断受挫。第三幕（解决，25%）：高潮和结局。',
        five_act: '五幕剧结构。第一幕-开端：引出核心悬念。第二幕-上升：事态扩大。第三幕-高潮：转折点。第四幕-下降：余波。第五幕-结局：一切尘埃落定。',
        save_the_cat: '救猫咪节拍表（15个节拍）：开场画面→主题陈述→铺垫→催化剂→争执→第二幕开启→B故事→娱乐游戏→中点→反派逼近→一无所有→灵魂的黑夜→第三幕开启→结局→终场画面。',
        multi_line: '多线叙事结构。四组人物在同一时空的不同故事线，逐步交织，最终汇聚于一个关键事件。',
        short_video: '短视频快节奏结构。0-3秒钩子：悬念/冲突/反常识。3-15秒发展：快速推进。15-25秒高潮：最高张力点。25-30秒收尾：反转或留白。',
      };
      const genrePrompts: Record<string, string> = {
        commercial: '商业类型片：强冲突、快节奏、明确的情感线。情节驱动，人物为情节服务。',
        artistic: '文艺片：内心驱动、氛围感强、人物深度。用意象和留白讲故事。',
        short: '短剧/短视频：信息密度高、反转快、情绪浓度大。每一秒都要有价值。',
      };
      const sp = structurePrompts[p.structure] || structurePrompts.three_act;
      const gp = genrePrompts[p.genre] || '';

      return {
        system: `你是一位资深编剧，现在要为一部作品设计完整的场景大纲。你必须像一个真正的编剧那样工作——考虑节奏、张力、可拍摄性。

${sp}

${gp}

编写原则：
1. 每场戏都要有明确的戏剧功能（推进情节/揭示性格/制造冲突/埋下伏笔）
2. 场景标题要具体可感，不是抽象的概括
3. 内容摘要要写出这场戏的「戏剧核」——发生了什么、谁变了、关键的台词或动作
4. 场景之间要有因果关系——上一场戏的结果引发下一场戏
5. 节奏要张弛有度，有爆发的戏也有安静的戏
6. 拒绝AI味的空洞表述，每一句都要具体

故事前提：${p.premise || '由AI自由发挥，创作一个原创故事'}

请仅输出一个JSON数组，每个元素是一个场次：
[{"title":"场景标题（具体地点+事件）","location":"interior或exterior","timeOfDay":"day/night/dusk/dawn","characters":["角色名"],"content":"场景核心内容摘要，80-150字，包含戏剧冲突和关键动作/台词","order":序号}]`,
        user: `作品名称：《${p.title}》
类型：${p.premise || '原创故事'}
请为上述作品生成完整的大纲。注意：每场戏的摘要必须具体、有画面感、有冲突，不能空洞。`,
      };
    }

    case 'generateSceneContent': {
      const p = params as {
        title: string; genre: string; sceneTitle: string; location: string;
        timeOfDay: string; characters: string[]; summary: string; previousScene?: string; nextScene?: string;
      };

      const antiAICheatsheet = `【防止AI味的写作守则】
- 禁止使用以下词语和句式：不仅、而且、然而（尽量不用）、更重要的（是）、值得（一提）的是、从某种意义上说、毋庸置疑、综上所述
- 禁止使用以下描述模式：「眼神中闪过一丝XX」「嘴角扬起XX的弧度」「心中涌起XX」——这些是AI写人物反应的万能模板
- 动作描写要具体：不要写「他感到愤怒」，要写他一拳砸在桌子上，杯子跳了一下
- 对话要像真人在说话：可以打断、可以有废话、可以有非逻辑跳跃
- 环境描写为情绪服务：紧张时不写「灯光昏暗」，写「他只能看清自己握刀的手指关节一节一节的白色」
- 每个场景只写一件事：别试图在一场戏里塞太多信息`;

      const genreStyles: Record<string, string> = {
        commercial: '商业类型片风格：快节奏，动作描写精准简洁，对话信息量大，每句台词都在推进情节或揭示信息。镜头意识强——想象这场戏拍出来是什么样子。',
        artistic: '文艺片风格：内心视角，情境氛围，留白与暗示并重。多写人物细微的动作和表情，少用语言直接表达情感。环境即心境。',
        short: '短剧风格：极高信息密度。每一句都值得观众的注意力。快速切入、快速离开，不拖泥带水。情绪浓度大。',
      };

      return {
        system: `你是一个经验丰富的编剧，现在需要你直接写出一个完整的剧本场景。请用标准的影视剧本格式写作。

${genreStyles[p.genre] || genreStyles.commercial}

${antiAICheatsheet}

格式规范：
- 场景标题：【内景/外景 - 场景名称 - 时间】
- 环境描写紧跟场景标题后，单独一段
- 人物对白格式：角色名：台词内容（可选动作提示用括号标注）
- 动作描写用【】或单独段落
- 字数600-1200字，确保内容充实

前一场戏：${p.previousScene || '无（本场为开场或独立场景）'}
后一场戏：${p.nextScene || '无'}

请直接输出完整剧本内容，不要加任何解释、注脚、或非剧本文字，也不要加"——全剧终——"之类的标记。`,
        user: `场景：${p.sceneTitle}
类型：${p.location === 'interior' ? '内景' : '外景'} · ${p.timeOfDay}
出场人物：${p.characters.join('、')}
场景梗概：${p.summary}

请直接写出这场戏的完整剧本内容。`,
      };
    }

    case 'generateDialogue': {
      const p = params as { characters: Array<{ name: string; personality: string; relationship: string }>; situation: string; length?: string };
      const charList = p.characters.map(c => `- ${c.name}：${c.personality}，与对方关系：${c.relationship}`).join('\n');
      return {
        system: `你是对话写作专家。请根据人物设定和情境，写出一段真实自然的对白。

写作原则：
1. 每句话都要符合这个人物的性格和说话习惯
2. 好的对话不是信息传递，是人物在「做」什么——说服、隐瞒、试探、伤害、安慰
3. 要有「听不见的声音」——话外之意、欲言又止、故意岔开话题
4. 对话过程中人物状态要有变化：开头和结尾时情绪不一样
5. 拒绝毫无意义的寒暄和功能性的信息交代
6. 节奏要自然：问答、沉默、打断、抢话、话题跳跃

格式：
角色名：（可选的动作/表情提示）台词内容

请只输出对白文本，不要加任何解释或场景描述。${p.length === 'short' ? '长度控制在6-10个来回。' : '长度控制在10-16个来回。'}`,
        user: `人物设定：\n${charList}\n\n情境：${p.situation}`,
      };
    }

    case 'suggestPlot': {
      const p = params as { genre: string; currentPlot: string; characters?: string };
      return {
        system: `你是情节发展顾问。针对当前剧情停滞点，提供三个具体可行的剧情推进方案。

要求：
1. 每条必须是具体的、可执行的情节节点，不是抽象的方向建议
2. 三条走向要截然不同——紧张型/情感型/悬疑型各一条
3. 每条描述50-80字，写清楚「发生什么」和「导致什么变化」

请仅输出一个JSON数组：
[{"type":"surprise","title":"意外的转折","description":"具体的剧情发展描述"},{"type":"emotional","title":"情感的爆发","description":""},{"type":"reveal","title":"秘密的揭露","description":""}]

不要输出其他任何内容。`,
        user: `类型：${p.genre}\n当前剧情：${p.currentPlot || '需要AI自由发挥'}${p.characters ? '\n已知角色：' + p.characters : ''}`,
      };
    }

    default:
      return { system: '', user: '' };
  }
}

export interface ApiResult {
  status: number;
  body: Record<string, unknown>;
}

export async function handleAi(body: RequestBody): Promise<ApiResult> {
  const { action, apiKey, provider = 'deepseek', params } = body;

  if (!apiKey) {
    return { status: 400, body: { error: '请先在设置页面配置您的 API Key' } };
  }

  if (!action || !params) {
    return { status: 400, body: { error: '缺少必要参数 action 或 params' } };
  }

  const endpoint = ENDPOINTS[provider] || ENDPOINTS.deepseek;
  const model = MODELS[provider] || MODELS.deepseek;
  const prompts = buildPrompt(action, params);

  if (!prompts.system) {
    return { status: 400, body: { error: `不支持的 action: ${action}` } };
  }

  try {
    const isOutlineOrScene = action === 'generateOutline' || action === 'generateSceneContent';
    const isDialogue = action === 'polishDialog' || action === 'generateDialogue';

    const maxTokens = isOutlineOrScene ? 3000 : isDialogue ? 1200 : 1500;

    const payload: Record<string, unknown> = {
      model,
      messages: [
        { role: 'system', content: prompts.system },
        { role: 'user', content: prompts.user },
      ],
      temperature: 0.9,
      max_tokens: maxTokens,
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
      return { status: aiResponse.status, body: { error: errMsg } };
    }

    if (!responseText.trim()) {
      return { status: 502, body: { error: '大模型返回了空内容，请重试' } };
    }

    let parsed: { choices?: Array<{ message?: { content?: string } }> };
    try {
      parsed = JSON.parse(responseText);
    } catch {
      return { status: 502, body: { error: '解析大模型返回内容失败' } };
    }

    const content = parsed?.choices?.[0]?.message?.content || '';
    if (!content) {
      return { status: 502, body: { error: '大模型未返回有效内容' } };
    }

    let result: unknown;
    const textOnlyActions = ['polishDialog', 'generateDialogue', 'generateSceneContent'];
    if (textOnlyActions.includes(action)) {
      result = { content: content.trim() };
    } else {
      try {
        let jsonStr = content.trim();
        const jsonStart = jsonStr.indexOf('{');
        const arrStart = jsonStr.indexOf('[');
        if (arrStart !== -1 && (jsonStart === -1 || arrStart < jsonStart)) {
          jsonStr = jsonStr.slice(arrStart);
        } else if (jsonStart !== -1) {
          jsonStr = jsonStr.slice(jsonStart);
        }
        result = JSON.parse(jsonStr);
      } catch {
        result = { raw: content };
      }
    }

    return { status: 200, body: { success: true, data: result } };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '未知错误';
    return { status: 500, body: { error: `服务异常：${message}` } };
  }
}
