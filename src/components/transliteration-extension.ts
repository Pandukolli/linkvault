import { EditorView } from "@tiptap/pm/view";

interface TransHistory {
  fromPos: number;
  toPos: number; // Position after the native word and before the space
  originalEnglish: string;
  nativeScript: string;
  timestamp: number;
}

let lastTransliterated: TransHistory | null = null;
let isFetching = false;

export function handleTransliterationKeyDown(
  view: EditorView,
  event: KeyboardEvent,
  typingLanguage: string
): boolean {
  if (typingLanguage === "en") return false;

  const { state, dispatch } = view;
  const { selection, tr } = state;

  // 1. Handle UNDO via Backspace
  if (event.key === "Backspace") {
    if (lastTransliterated && Date.now() - lastTransliterated.timestamp < 10000) {
      if (selection.empty && (selection.from === lastTransliterated.toPos || selection.from === lastTransliterated.toPos + 1)) {
        const currentWordRange = state.doc.textBetween(lastTransliterated.fromPos, lastTransliterated.toPos);
        if (currentWordRange === lastTransliterated.nativeScript) {
          event.preventDefault();
          
          const isSpaceIncluded = selection.from === lastTransliterated.toPos + 1;
          const replaceEnd = isSpaceIncluded ? lastTransliterated.toPos + 1 : lastTransliterated.toPos;
          
          tr.replaceWith(
            lastTransliterated.fromPos, 
            replaceEnd, 
            state.schema.text(lastTransliterated.originalEnglish)
          );
          
          dispatch(tr);
          lastTransliterated = null;
          return true;
        }
      }
    }
    return false;
  }

  // 2. Handle Space Transliteration
  if (event.code === "Space" || event.key === " ") {
    if (!selection.empty) return false;

    const $pos = selection.$from;
    const textBefore = $pos.parent.textBetween(0, $pos.parentOffset, null, '\n');
    const words = textBefore.split(/[\s\n]+/);
    const lastWord = words[words.length - 1];

    if (lastWord && /^[a-zA-Z]+$/.test(lastWord)) {
      event.preventDefault(); // Pause rendering the space

      const wordStart = $pos.pos - lastWord.length;
      const wordEnd = $pos.pos;
      isFetching = true;
      
      fetch(`https://inputtools.google.com/request?text=${lastWord}&itc=${typingLanguage}-t-i0-und&num=1&cp=0&cs=1&ie=utf-8&oe=utf-8&app=demopage`)
        .then(res => res.json())
        .then(data => {
          if (data[0] === 'SUCCESS') {
            const nativeScript = data[1]?.[0]?.[1]?.[0];
            if (nativeScript) {
              const viewState = view.state;
              const currentDocText = viewState.doc.textBetween(wordStart, wordEnd);
              
              if (currentDocText === lastWord) {
                const newTr = viewState.tr;
                newTr.replaceWith(wordStart, wordEnd, viewState.schema.text(nativeScript + " "));
                view.dispatch(newTr);
                
                lastTransliterated = {
                  fromPos: wordStart,
                  toPos: wordStart + nativeScript.length,
                  originalEnglish: lastWord,
                  nativeScript: nativeScript,
                  timestamp: Date.now()
                };
                return;
              }
            }
          }
          view.dispatch(view.state.tr.insertText(" "));
        })
        .catch(() => {
          view.dispatch(view.state.tr.insertText(" "));
        })
        .finally(() => {
          isFetching = false;
        });

      return true;
    }
  }

  return false;
}
