export default function() {
  //
  // {
  //   "message": "API rate limit exceeded for 72.229.126.12. (But here's the good news: Authenticated requests get a higher rate limit. Check out the documentation for more details.)",
  //   "documentation_url": "https://developer.github.com/v3/#rate-limiting"
  // }

  this.passthrough();
  this.passthrough("https://api.github.com/*");
}
