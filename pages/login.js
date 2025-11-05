export default function Login(req) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Login - Bun Server</title>
      <link rel="stylesheet" href="/public/styles.css">
    </head>
    <body>
      <div class="container">
        <div class="login-card">
          <h1>🔐 Login</h1>
          <p class="subtitle">Enter your credentials to continue</p>
          
          <form class="login-form" onsubmit="handleLogin(event)">
            <div class="form-group">
              <label for="email">Email</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                placeholder="your@email.com" 
                required
              />
            </div>
            
            <div class="form-group">
              <label for="password">Password</label>
              <input 
                type="password" 
                id="password" 
                name="password" 
                placeholder="••••••••" 
                required
              />
            </div>
            
            <div class="form-options">
              <label class="checkbox">
                <input type="checkbox" name="remember" />
                <span>Remember me</span>
              </label>
              <a href="#" class="link">Forgot password?</a>
            </div>
            
            <button type="submit" class="button button-primary">
              Sign In
            </button>
          </form>
          
          <div class="divider">
            <span>or</span>
          </div>
          
          <p class="signup-text">
            Don't have an account? <a href="#" class="link">Sign up</a>
          </p>
          
          <div class="navigation">
            <a href="/" class="link">← Back to Home</a>
          </div>
        </div>
      </div>

      <script>
        function handleLogin(event) {
          event.preventDefault();
          const formData = new FormData(event.target);
          const email = formData.get('email');
          const password = formData.get('password');
          
          alert('Login functionality would be implemented here!\\n\\nEmail: ' + email);
          
          // In a real application, you would send this to your backend
          // fetch('/api/login', {
          //   method: 'POST',
          //   body: JSON.stringify({ email, password })
          // })
        }
      </script>
    </body>
    </html>
  `;
}
