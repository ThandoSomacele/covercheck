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
		client: {start:"_app/immutable/entry/start.Dra6xU-D.js",app:"_app/immutable/entry/app.Dv69D8hq.js",imports:["_app/immutable/entry/start.Dra6xU-D.js","_app/immutable/chunks/C2wZKBk0.js","_app/immutable/chunks/BsaVdYKB.js","_app/immutable/chunks/BPwoOjdN.js","_app/immutable/entry/app.Dv69D8hq.js","_app/immutable/chunks/BsaVdYKB.js","_app/immutable/chunks/B3wobsgq.js","_app/immutable/chunks/DkXlLIkS.js","_app/immutable/chunks/BPwoOjdN.js","_app/immutable/chunks/DsoAu5da.js","_app/immutable/chunks/DfU4WaQY.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
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
