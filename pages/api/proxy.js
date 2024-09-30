// pages/api/proxy.js

export default async function handler(req, res) {
  // 设置 CORS 头，允许所有源访问
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // 处理预检请求（OPTIONS 请求）
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 获取目标 URL（从环境变量中提取）
  const targetUrl = process.env.TARGET_URL;

  if (!targetUrl) {
    res.status(500).json({ error: 'TARGET_URL is not defined in environment variables' });
    return;
  }

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        ...req.headers,
        host: new URL(targetUrl).host
      },
      body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined
    });

    // 读取响应数据
    const data = await response.text();

    // 设置缓存头 (例如缓存1小时)
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=59');

    // 转发目标响应
    res.status(response.status);
    res.send(data);
  } catch (error) {
    res.status(500).json({ error: 'Proxy error' });
  }
}
