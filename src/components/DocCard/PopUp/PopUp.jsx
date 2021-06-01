import React from 'react';

const PopUp = ({ doc, hidePopUp }) => {
    console.log(doc);
    let time = new Date(doc.modifiedTime).toLocaleString('en-GB', { timeZone: 'UTC' });

    return (
        <>
            <div className="popup-container" onClick={hidePopUp} style={{ top: `${window.scrollY}px` }}>
                <div className="popup">
                    <img className="popup__cross" src="/cross.svg" alt="" />
                    <div className="popup__stats">
                        <a href={`https://docs.google.com/document/d/${doc.id}`} className="popup__stats__heading" target="_blank" rel="noreferrer">{doc.title}</a>
                        <p className="popup__link">Total links: {doc.links.foundLinks.length}</p>
                        <p className="popup__link">Found in other files: {doc.links.matchedLinksInOtherFiles.length}</p>
                        <p className="popup__stats__modified-time">
                            <img src="/arrowcircle.svg" alt="" />
                            {time}
                        </p>
                    </div>
                    <div className="popup__links">
                        <div className="popup__links__column">
                            <h4 className="popup__links__title">Found links:</h4>
                            {doc.links.foundLinks.map((link) => (
                                <a key={link.link + Math.random()} href={link.link} className="popup__link" target="_blank" rel="noreferrer">{link.linkTitle ? link.linkTitle : link.link}</a>
                            ))}
                        </div>
                        <div className="popup__links__column">
                            <h4 className="popup__links__title">Found in files:</h4>
                            {doc.links.matchedLinksInOtherFiles.map((item) => (
                                <a key={item.foundInDocID + Math.random()} href={`https://docs.google.com/document/d/${item.foundInDocID}`} className="popup__link" target="_blank" rel="noreferrer">{item.foundInDocTitle}</a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PopUp;
