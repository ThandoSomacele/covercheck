import { y as ensure_array_like, z as attr_class, F as stringify, x as attr } from "../../chunks/index.js";
import { e as escape_html } from "../../chunks/context.js";
function _page($$renderer) {
  let messages = [];
  let input = "";
  let loading = false;
  let selectedProvider = "all";
  const providers = [
    { value: "all", label: "🌐 All Providers" },
    { value: "Discovery Health", label: "💎 Discovery Health" },
    {
      value: "Bonitas Medical Fund",
      label: "🏥 Bonitas Medical Fund"
    },
    { value: "Keycare", label: "🔑 Keycare" }
  ];
  $$renderer.push(`<div class="chat-container svelte-1uha8ag"><header class="svelte-1uha8ag"><h1 class="svelte-1uha8ag">🏥 CoverCheck</h1> <p class="svelte-1uha8ag">Find answers about South African medical aid plans with official sources</p> <div class="provider-selector svelte-1uha8ag"><label for="provider" class="svelte-1uha8ag">Search in:</label> `);
  $$renderer.select(
    { id: "provider", value: selectedProvider, class: "" },
    ($$renderer2) => {
      $$renderer2.push(`<!--[-->`);
      const each_array = ensure_array_like(providers);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let provider = each_array[$$index];
        $$renderer2.option(
          { value: provider.value, class: "" },
          ($$renderer3) => {
            $$renderer3.push(`${escape_html(provider.label)}`);
          },
          "svelte-1uha8ag"
        );
      }
      $$renderer2.push(`<!--]-->`);
    },
    "svelte-1uha8ag"
  );
  $$renderer.push(`</div></header> <div class="messages svelte-1uha8ag">`);
  if (messages.length === 0) {
    $$renderer.push("<!--[-->");
    $$renderer.push(`<div class="welcome svelte-1uha8ag"><h2 class="svelte-1uha8ag">👋 Welcome to CoverCheck!</h2> <p class="welcome-subtitle svelte-1uha8ag">Ask me anything about South African medical aid plans. I'll provide answers with official sources.</p> <div class="suggestions svelte-1uha8ag"><button class="svelte-1uha8ag">💊 Chronic condition coverage</button> <button class="svelte-1uha8ag">🏥 Hospital benefits</button> <button class="svelte-1uha8ag">👶 Maternity coverage</button> <button class="svelte-1uha8ag">📊 Compare benefits</button></div></div>`);
  } else {
    $$renderer.push("<!--[!-->");
    $$renderer.push(`<!--[-->`);
    const each_array_1 = ensure_array_like(messages);
    for (let $$index_2 = 0, $$length = each_array_1.length; $$index_2 < $$length; $$index_2++) {
      let message = each_array_1[$$index_2];
      $$renderer.push(`<div${attr_class(`message message-${stringify(message.role)}`, "svelte-1uha8ag")}><div class="message-content svelte-1uha8ag">${escape_html(message.content)}</div> `);
      if (message.sources && message.sources.length > 0) {
        $$renderer.push("<!--[-->");
        $$renderer.push(`<div class="sources svelte-1uha8ag"><strong class="svelte-1uha8ag">📚 Sources:</strong> <div class="source-links svelte-1uha8ag"><!--[-->`);
        const each_array_2 = ensure_array_like(message.sources);
        for (let i = 0, $$length2 = each_array_2.length; i < $$length2; i++) {
          let source = each_array_2[i];
          $$renderer.push(`<a${attr("href", source.url)} target="_blank" rel="noopener noreferrer" class="source-link svelte-1uha8ag"${attr("title", `${stringify(source.provider)} - ${stringify(Math.round(source.relevance * 100))}% relevant`)}>${escape_html(i + 1)}. ${escape_html(source.title)} <span class="provider-badge svelte-1uha8ag">${escape_html(source.provider)}</span></a>`);
        }
        $$renderer.push(`<!--]--></div></div>`);
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
