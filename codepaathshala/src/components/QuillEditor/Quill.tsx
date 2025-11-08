import { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./Quill.css";
const fontSizeArr = ['8px', '9px', '10px', '12px', '14px', '16px', '20px', '24px', '32px', '42px', '54px', '68px', '84px', '98px'];
const Font = ReactQuill.Quill.import('formats/font')
let Size = ReactQuill.Quill.import('attributors/style/size');
Size.whitelist = fontSizeArr;
ReactQuill.Quill.register(Size, true);
Font.whitelist = ['mirza', 'roboto']
ReactQuill.Quill.register(Font, true);
function QuillEditor({ onChange }: any) {
    const [value, setValue] = useState('');
    const [toastDisplayed, setToastDisplayed] = useState(false);
    const handleChange = (value: any) => {
        setValue(value);
        onChange(value);
    };
    const modules = {
        toolbar: {
            container: [
                [{ header: [1, 2, 3, 4, 5, 6, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                [{ 'script': 'sub' }, { 'script': 'super' }],
                ['image', 'code-block', 'link', 'blockquote'],
                ['link', 'image', 'video'],
                ['clean'],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'font': ['mirza'] }],
                [{ 'align': [] }],
                [{ 'indent': '-1' }, { 'indent': '+1' }],
                [{ 'header': 1 }, { 'header': 2 }, { 'header': 3 }, { 'header': 4 }, { 'header': 5 }, { 'header': 6 }],
            ],

        }
    }
    const handlePaste = (e: any) => {
        e.preventDefault();
        if (!toastDisplayed) {
            toast.error('You cannot perform the paste action', {
                position: 'bottom-right',
                autoClose: 1000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: 'colored',
                onClose: () =>

                    setTimeout(() => { setToastDisplayed(false) }, 2000)
            });

            setToastDisplayed(true);

        }

    };
    return <>
        <div className=''>
            <ReactQuill theme="snow" placeholder='Compose an epic...' className="custom-height" value={value} modules={modules} onChange={handleChange}
                onKeyDown={(e: any) => {
                    if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
                        handlePaste(e);
                    }
                }
                }
                // @ts-ignore
                onMouseDown={(e) => {
                    e.preventDefault();
                }}


            />

            <ToastContainer />
        </div>
    </>


}
export default QuillEditor;