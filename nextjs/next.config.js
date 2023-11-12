/** @type {import('next').NextConfig} */
const nextConfig = {
    swcMinify: true,
    images: {
        domains: ["d3flaz883pr9hy.cloudfront.net"],
    },
    async rewrites() {
        return [
          {
            source: "/api/movies",
            destination: `https://api.themoviedb.org/3/movie/popular?api_key=${process.env.API_KEY}`
          },
          {
            source: "/api/movies/:id",
            destination: `https://api.themoviedb.org/3/movie/:id?api_key=${process.env.API_KEY}`
          },
        ]
      }
}

module.exports = nextConfig
