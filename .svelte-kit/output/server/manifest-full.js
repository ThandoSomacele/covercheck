export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["robots.txt"]),
	mimeTypes: {".txt":"text/plain"},
	_: {
		client: {start:"_app/immutable/entry/start.BSgtnP5j.js",app:"_app/immutable/entry/app.KpIb7Dx5.js",imports:["_app/immutable/entry/start.BSgtnP5j.js","_app/immutable/chunks/D9NshTJD.js","_app/immutable/chunks/D6TGgy1N.js","_app/immutable/chunks/Bx5tsWKU.js","_app/immutable/entry/app.KpIb7Dx5.js","_app/immutable/chunks/D6TGgy1N.js","_app/immutable/chunks/YFNwkPnb.js","_app/immutable/chunks/CipJ4ELT.js","_app/immutable/chunks/Bx5tsWKU.js","_app/immutable/chunks/D0Xo9JQK.js","_app/immutable/chunks/CDeVdgJG.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/api/chat",
				pattern: /^\/api\/chat\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/chat/_server.ts.js'))
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
