import React from 'react';

const TableIcon = ({ icon, title }) => {
    console.log(icon);
    switch (icon) {
        case "document":
            return <><img alt="" src="/Docs.svg" /><p>{title}</p></>;
            break;
        case "presentation":
            return <img alt="" src="/Slides.svg" />;
            break;
        case "spreadsheet":
            return <img alt="" src="/Sheets.svg" />;
            break;
        default:
            return <img alt="" src="" />;
            break;
    }
}

export default TableIcon;