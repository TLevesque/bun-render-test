export default function Home(req) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Home - Bun Server</title>
      <link rel="stylesheet" href="/public/styles.css">
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>👋 Hello from Bun.js!</h1>
          <p class="subtitle">Welcome to your file-system router server</p>
        </div>
        
        <div class="card">
          <h2>✨ Features</h2>
          <ul>
            <li>Next.js-style file system routing</li>
            <li>API endpoints support</li>
            <li>Powered by Bun.js</li>
            <li>Fast and lightweight</li>
            <li>Easy to extend</li>
          </ul>
        </div>

        <div class="card">
          <h2>📡 API Endpoints</h2>
          <div class="api-section">
            <div class="api-endpoint">
              <h3>GET /api/time</h3>
              <p>Returns the current time in multiple formats</p>
              <button class="button" onclick="testApi('/api/time')">Test Endpoint</button>
            </div>
            
            <div class="api-endpoint">
              <h3>GET /api/day</h3>
              <p>Returns information about the current day</p>
              <button class="button" onclick="testApi('/api/day')">Test Endpoint</button>
            </div>
          </div>
          
          <div id="api-result" class="api-result" style="display: none;">
            <h4>Response:</h4>
            <pre id="api-response"></pre>
          </div>
        </div>

        <div class="navigation">
          <h3>Navigate to:</h3>
          <a href="/login" class="button">Go to Login Page →</a>
        </div>

        <footer>
          <p>Built with ❤️ using Bun.js</p>
        </footer>
      </div>

      <script>
        async function testApi(endpoint) {
          const resultDiv = document.getElementById('api-result');
          const responseDiv = document.getElementById('api-response');
          
          try {
            resultDiv.style.display = 'block';
            responseDiv.textContent = 'Loading...';
            
            const response = await fetch(endpoint);
            const data = await response.json();
            
            responseDiv.textContent = JSON.stringify(data, null, 2);
          } catch (error) {
            responseDiv.textContent = 'Error: ' + error.message;
          }
        }
      </script>
    </body>
    </html>
  `;
}
