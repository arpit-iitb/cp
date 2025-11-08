import { useState, useRef, useEffect } from "react";
import MonacoEditor from '@monaco-editor/react';
import * as monaco from "monaco-editor";
import { EditorInterface } from "_utils/interface";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./Editor.css"
function Editor({ language, theme, codes, id, onCodeChange, disableCopyPaste }: EditorInterface) {
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
    const [editorCode, setEditorCode] = useState<string>(codes);
    const [toastDisplayed, setToastDisplayed] = useState(false);
    useEffect(() => {
        setEditorCode(codes);
    }, [codes]);

    useEffect(() => {
        const editor: any = editorRef.current

        if (editorRef.current) {
            monaco.editor.setTheme(theme);
            monaco.editor.setModelLanguage(editor.getModel()!, language);
        }
    }, [theme, language, codes])

    const handleCodeChange = (newCode: string | undefined) => {
        setEditorCode(newCode ?? "");
        onCodeChange(newCode ?? "");
    };
    const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor, _monaco: typeof monaco) => {
        editorRef.current = editor;
        // if (disableCopyPaste) {
        //     editor.onKeyDown((event: any) => {
        //         const { keyCode, ctrlKey, metaKey } = event;
        //         if ((keyCode === 33 || keyCode === 52) && (metaKey || ctrlKey)) {
        //             event.preventDefault();
        //             if (!toastDisplayed) {
        //                 toast.error('You cannot perform the paste action', {
        //                     position: 'bottom-right',
        //                     autoClose: 1000,
        //                     hideProgressBar: false,
        //                     closeOnClick: true,
        //                     pauseOnHover: true,
        //                     draggable: true,
        //                     progress: undefined,
        //                     theme: 'colored',
        //                     onClose: () =>

        //                         setTimeout(() => { setToastDisplayed(false) }, 2000)
        //                 });

        //                 setToastDisplayed(true);

        //             }

        //         }
        //     })
        // }

    };
    return (
        <>
            <MonacoEditor
                height="60vh"
                className="w-full bg-black p-2 rounded-lg"
                language={language}
                value={editorCode}
                onChange={handleCodeChange}
                theme={theme}

                options={{
                    pasteAs: {
                        enabled: false,
                        showPasteSelector: 'never'
                    },
                    hover: {
                        enabled: false,
                    },
                    parameterHints: {
                        enabled: false,
                    },
                    minimap: { enabled: false },
                    contextmenu: false,
                    quickSuggestions: false,
                    insertSpaces: true,
                    wordBasedSuggestions: "off",
                    occurrencesHighlight: "off",
                    renderLineHighlight: "none",
                    scrollBeyondLastLine: false,
                    overviewRulerBorder: false,
                    lineDecorationsWidth: "10px",
                    defaultColorDecorators: true,
                    renderValidationDecorations: "on",
                    roundedSelection: false,
                    colorDecorators: false,
                    hideCursorInOverviewRuler: true,
                    matchBrackets: "always",
                    selectionHighlight: false,
                    find: {
                        cursorMoveOnType: false,
                        addExtraSpaceOnTop: false
                    },
                    lineNumbersMinChars: 3,
                    cursorWidth: 2,
                    fontSize: 15,
                    automaticLayout: true,

                }}
                onMount={handleEditorDidMount}
            />

            <ToastContainer />
        </>



    )
}
export default Editor;