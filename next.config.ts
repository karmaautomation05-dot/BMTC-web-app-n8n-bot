import { withSerwist } from "@serwist/turbopack";

export default withSerwist({
  async headers() {
    return [
      {
        source: "/((?!_next/static|_next/image|favicon|icons).*)",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
        ],
      },
    ];
  },
});
