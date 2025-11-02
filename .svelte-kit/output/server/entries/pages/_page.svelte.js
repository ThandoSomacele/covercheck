import { y as ensure_array_like, z as attr_class, F as stringify, x as attr } from "../../chunks/index.js";
import { e as escape_html } from "../../chunks/context.js";
function _page($$renderer) {
  let messages = [];
  let input = "";
  let loading = false;
  $$renderer.push(`<div class="chat-container svelte-1uha8ag"><header class="svelte-1uha8ag"><h1 class="svelte-1uha8ag">🇿🇦 Insurance Assistant</h1> <p class="svelte-1uha8ag">Your medical aid and insurance questions answered simply</p></header> <div class="messages svelte-1uha8ag">`);
  if (messages.length === 0) {
    $$renderer.push("<!--[-->");
    $$renderer.push(`<div class="welcome svelte-1uha8ag"><h2 class="svelte-1uha8ag">👋 Hello! How can I help you today?</h2> <div class="suggestions svelte-1uha8ag"><button class="svelte-1uha8ag">💰 Cost example</button> <button class="svelte-1uha8ag">📊 Compare plans</button> <button class="svelte-1uha8ag">📋 Filing claims</button></div></div>`);
  } else {
    $$renderer.push("<!--[!-->");
    $$renderer.push(`<!--[-->`);
    const each_array = ensure_array_like(messages);
    for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
      let message = each_array[$$index_1];
      $$renderer.push(`<div${attr_class(`message message-${stringify(message.role)}`, "svelte-1uha8ag")}><div class="message-content svelte-1uha8ag">${escape_html(message.content)}</div> `);
      if (message.sources && message.sources.length > 0) {
        $$renderer.push("<!--[-->");
        $$renderer.push(`<div class="sources svelte-1uha8ag"><strong class="svelte-1uha8ag">Sources:</strong> <ul class="svelte-1uha8ag"><!--[-->`);
        const each_array_1 = ensure_array_like(message.sources);
        for (let $$index = 0, $$length2 = each_array_1.length; $$index < $$length2; $$index++) {
          let source = each_array_1[$$index];
          $$renderer.push(`<li class="svelte-1uha8ag">${escape_html(source)}</li>`);
        }
        $$renderer.push(`<!--]--></ul></div>`);
      } else {
        $$renderer.push("<!--[!-->");
      }
      $$renderer.push(`<!--]--></div>`);
    }
    $$renderer.push(`<!--]--> `);
    {
      $$renderer.push("<!--[!-->");
    }
    $$renderer.push(`<!--]-->`);
  }
  $$renderer.push(`<!--]--></div> <form class="input-form svelte-1uha8ag"><textarea placeholder="Ask me anything about your medical aid or insurance..." rows="1"${attr("disabled", loading, true)} class="svelte-1uha8ag">`);
  const $$body = escape_html(input);
  if ($$body) {
    $$renderer.push(`${$$body}`);
  }
  $$renderer.push(`</textarea> <button type="submit"${attr("disabled", !input.trim() || loading, true)} class="svelte-1uha8ag">${escape_html("→")}</button></form></div>`);
}
export {
  _page as default
};
