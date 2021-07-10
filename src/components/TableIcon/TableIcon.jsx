import React from 'react';

const TableIcon = ({ icon, title }) => {
    console.log(icon);
    switch (icon) {
        case "document":
            return <><img src="/Docs.svg" /><p>{title}</p></>;
            break;
        case "presentation":
            return <img src="/Slides.svg" />;
            break;
        case "spreadsheet":
            return <img src="/Sheets.svg" />;
            break;
        default:
            return <img src="" />;
            break;
    }
}

export default TableIcon;