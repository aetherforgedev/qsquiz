import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { questions, categories, sources } from "../questions.js";

test("all 60 questions have usable choices, solutions, categories and explanations", () => {
  assert.equal(questions.length, 60);
  assert.equal(new Set(questions.map((q) => q.id)).size, 60);
  for (const q of questions) {
    assert(categories.some((c) => c.id === q.category));
    assert.equal(q.choices.length, 4);
    assert.equal(new Set(q.choices).size, 4);
    assert(q.correct >= 0 && q.correct < 4);
    assert(q.explanation.length > 130);
    assert(q.takeaway.length > 5);
    if (q.source) assert(sources[q.source]?.[1].startsWith("https://"));
  }
  for (const c of categories)
    assert(questions.some((q) => q.category === c.id));
});

// A small DOM adapter runs the actual application logic, including click handlers,
// persistence and round completion, without a browser dependency.
function launch(initial, blocked = false) {
  let storage = initial,
    markup = "";
  const elements = new Map();
  function element(key) {
    if (!elements.has(key))
      elements.set(key, {
        onclick: null,
        addEventListener(name, fn) {
          this["on" + name] = fn;
        },
        focus() {},
        scrollIntoView() {},
        showModal() {},
        close() {},
        getBoundingClientRect() {
          return { left: 0, right: 100, top: 0, bottom: 100 };
        },
      });
    return elements.get(key);
  }
  const root = element("#app");
  Object.defineProperty(root, "innerHTML", {
    get: () => markup,
    set: (v) => {
      markup = v;
      elements.clear();
      elements.set("#app", root);
    },
  });
  root.querySelector = () => element("heading");
  root.querySelectorAll = (selector) => {
    const attr = selector.slice(1, -1);
    return [...markup.matchAll(new RegExp(`${attr}="([^"]+)"`, "g"))].map(
      (m) => {
        const el = element(m[0]);
        el.dataset = { [attr.replace("data-", "")]: m[1] };
        return el;
      },
    );
  };
  const context = vm.createContext({
    questions,
    categories,
    sources,
    console,
    document: { querySelector: element },
    localStorage: {
      getItem() {
        if (blocked) throw Error("blocked");
        return storage;
      },
      setItem(k, v) {
        if (blocked) throw Error("blocked");
        storage = v;
      },
    },
    window: { scrollTo() {} },
    matchMedia: () => ({ matches: true }),
    confirm: () => true,
  });
  const code = readFileSync(new URL("../app.js", import.meta.url), "utf8")
    .replace(/^import[\s\S]*?from ['"]\.\/questions\.js['"];?\r?\n/, "")
    .replace("export function shuffle", "function shuffle");
  vm.runInContext(code, context);
  return {
    context,
    click(key) {
      const el = element(key);
      assert.equal(
        typeof el.onclick,
        "function",
        `Missing click handler: ${key}`,
      );
      el.onclick();
    },
    run: (s) => vm.runInContext(s, context),
    get html() {
      return markup;
    },
    get storage() {
      return storage;
    },
  };
}

test("a mixed round scores a wrong answer and nine correct answers, then repeats exactly the error", () => {
  const a = launch();
  a.click("#start");
  assert.equal(a.run("saved.session.items.length"), 10);
  const first = a.run("saved.session.items[0].id");
  a.run("answer(1)");
  assert.match(a.html, /Noch nicht ganz/);
  assert.match(a.html, /Richtige Antwort:/);
  // Answering twice must not overwrite the first response.
  a.run("answer(0)");
  assert.equal(a.run("saved.records[saved.session.items[0].id].right"), false);
  a.click("#next");
  for (let i = 1; i < 10; i++) {
    a.run("answer(0)");
    assert.match(a.html, /Richtig\. Gut gewusst/);
    a.click("#next");
  }
  assert.match(a.html, /9 von 10/);
  assert.match(a.html, /90<span>%/);
  assert.equal(a.run("Object.keys(saved.records).length"), 10);
  a.click("#retry");
  assert.equal(a.run("saved.session.items.length"), 1);
  assert.equal(a.run("saved.session.items[0].id"), first);
  a.run("answer(0)");
  a.click("#next");
  assert.match(a.html, /100<span>%/);
  assert.equal(a.run("stats().wrong"), 0);
});

test("a paused and reloaded round preserves the answer, question index and option order", () => {
  const a = launch();
  a.click("#start");
  a.run("answer(0)");
  a.click("#next");
  a.click("#exit");
  const state = a.storage,
    b = launch(state);
  assert.match(b.html, /Letzte Runde fortsetzen/);
  b.click("#resume");
  assert.equal(b.run("saved.session.index"), 1);
  assert.equal(b.run("saved.session.items[0].answer"), 0);
  assert.equal(b.storage, state);
});

test("category selection and full round contain only the selected topic", () => {
  const a = launch();
  a.run("filter='hack'; mode='all'; start()");
  assert.equal(a.run("saved.session.items.length"), 12);
  assert(
    a.run(
      "saved.session.items.every(i=>questions.find(q=>q.id===i.id).category==='hack')",
    ),
  );
});

test("empty error pool cannot start a round and corrupt storage safely falls back", () => {
  const a = launch("{broken");
  a.run("mode='review';home()");
  assert.match(a.html, /keine offenen Fehler/);
  a.run("start()");
  assert.equal(a.run("saved.session"), null);
  const b = launch(
    JSON.stringify({
      records: [],
      session: { items: [{ id: "unknown" }], index: 99 },
    }),
  );
  assert.match(b.html, /Frisches Wissen/);
  assert.equal(b.run("saved.session"), null);
});

test("storage restrictions do not prevent answering or reaching the result", () => {
  const a = launch(null, true);
  assert.match(a.html, /Speichern nicht verfügbar/);
  a.run("filter='qs'; mode='all'; start()");
  for (let i = 0; i < 5; i++) {
    a.run("answer(0)");
    a.click("#next");
  }
  assert.match(a.html, /5 von 5/);
});

test("shuffle maintains the complete set and moves the correct answer between positions", () => {
  const a = launch();
  assert(
    a.run(
      "Array.from({length:100},()=>shuffle([0,1,2,3])).every(v=>new Set(v).size===4 && v.every(n=>n>=0&&n<=3))",
    ),
  );
  assert(
    a.run(
      "new Set(Array.from({length:100},()=>shuffle([0,1,2,3]).indexOf(0))).size===4",
    ),
  );
});
