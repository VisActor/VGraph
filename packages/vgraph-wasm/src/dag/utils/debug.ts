// Wasm logger for debug
const errorPatterns = [
  [/^Error: (.*)/, "error"],
  [/^Warning: (.*)/, "warning"],
] as [RegExp, string][];
function parseStderrMessages(messages: any) {
  return messages.map((message: any) => {
    for (const [pattern, level] of errorPatterns) {
      let match;
      if ((match = pattern.exec(message)) !== null) {
        return { message: match[1].trimEnd(), level };
      }
    }

    return { message: message.trimEnd() };
  });
}

function parseAgerrMessages(messages: string) {
  const result = [];
  let level;

  for (let i = 0; i < messages.length; i++) {
    if (messages[i] === "Error" && messages[i + 1] === ": ") {
      level = "error";
      i += 1;
    } else if (messages[i] === "Warning" && messages[i + 1] === ": ") {
      level = "warning";
      i += 1;
    } else {
      result.push({ message: messages[i].trimEnd(), level });
    }
  }

  return result;
}

export function parseErrorMessages(module: any) {
  return parseAgerrMessages(module.agerrMessages).concat(
    parseStderrMessages(module.stderrMessages)
  );
}
