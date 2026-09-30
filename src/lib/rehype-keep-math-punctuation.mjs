const closingPunctuation = new Set([..."，。！？；：、,.!?;:)]}）］｝】〉》」』”’"]);

function hasClass(node, name) {
  return node?.type === "element" && node.properties?.className?.includes(name);
}

export default function rehypeKeepMathPunctuation() {
  return (tree) => {
    function keepTogether(node) {
      if (!Array.isArray(node.children) || hasClass(node, "inline-math-punctuation")) return;

      for (let index = 0; index < node.children.length - 1; index++) {
        const math = node.children[index];
        const following = node.children[index + 1];
        if (!hasClass(math, "katex") || following?.type !== "text") continue;

        let length = 0;
        for (const character of following.value) {
          if (!closingPunctuation.has(character)) break;
          length += character.length;
        }
        if (!length) continue;

        const group = {
          type: "element",
          tagName: "span",
          properties: { className: ["inline-math-punctuation"] },
          children: [math, { type: "text", value: following.value.slice(0, length) }],
        };
        const rest = following.value.slice(length);
        node.children.splice(index, 2, group, ...(rest ? [{ type: "text", value: rest }] : []));
      }

      for (const child of node.children) keepTogether(child);
    }

    keepTogether(tree);
  };
}
