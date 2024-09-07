import React from 'react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';

const PDFViewer = ({ pdfUrl }) => {
    if (!pdfUrl) {
        return <div>No PDF URL provided</div>;
    }

    return (
        <div  style={{ width: '600px', height: '1000px' }}>
            <Worker workerUrl="/pdf.worker.min.js">
                <Viewer sx={{width: '400px', height: '600px'}} fileUrl={pdfUrl} />
            </Worker>
        </div>
    );
};

export default PDFViewer;