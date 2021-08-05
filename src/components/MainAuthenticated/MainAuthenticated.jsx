import React, { Component } from 'react';
import './authenticated.css';
import SearchInput from '../SearchInput/SearchInput';
// import SearchParameters from '../SearchParameters/SearchParameters';
import UserAccess from '../UserAccess/UserAccess';
import DocsSection from '../DocsSection/DocsSection';
import { Table } from 'antd';
// import TableIcon from '../TableIcon/TableIcon';
import DocCard from '../DocCard/DocCard';

class MainAuthenticated extends Component {
    state = {
        googleAuth: this.props.googleAuth,
        inputIDtoSearch: '',
        searchInputValue: '',
        prevSearchInputValue: '',
        searchParametersValue: false,
        docObjects: [],
        ownedDocObjects: [],
        sortedDocObjects: [],
        sheetObjects: [],
        ownedSheetObjects: [],
        sortedSheetObjects: [],
        slidesObjects: [],
        ownedSlidesObjects: [],
        sortedSlidesObjects: [],
        inSearch: false,
        tooManyRequests: false
    }

    componentDidMount() {
        if (this.state.googleAuth) {
            this.getUserDocsList();
            // this.googleApiSlides();
            // this.googleApiSheets();
            // this.googleApiDocs();
        }
    }

    getDocumentInfo = async (event, docID = this.state.inputIDtoSearch, findLinks, error) => {

        // if (!error) {
        //     console.log("doc to search");
        // } else {
        //     console.log("doc to search after error");
        // }

        let { accessToken } = this.state.googleAuth;
        let docObj = {
            type: "document",
            id: docID,
            title: "Document",
            links: {
            },
            modifiedTime: undefined,
            owner: ""
        }
        return fetch(`https://docs.googleapis.com/v1/documents/${docID}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${accessToken}` }
        })
            .then(res => res.json())
            .then(res => {
                // console.log(res);
                docObj.title = res.title;
                docObj.res = res;
                if (findLinks) {
                    docObj.links = this.findDocumentLinks(res.body.content);
                }

                return fetch(`https://www.googleapis.com/drive/v3/files/${docID}?fields=modifiedTime,owners`, {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${accessToken}` }
                });
            })
            .then(res => res.json())
            .then(res => {
                docObj.modifiedTime = res.modifiedTime;
                docObj.owner = res.owners[0].emailAddress;
                return;
            })
            .then(() => {
                // console.log(docObj.links.foundLinks);
                return docObj;
            })
            .catch(err => console.log(err, docObj.res));
    }

    findDocumentLinks = (content, docID) => {
        // console.log(content);
        let links = {
            foundLinks: [],
            matchedLinksInOtherFiles: []
        }
        for (let i = 0; i < content.length; i++) {
            if (content[i].paragraph !== undefined && content[i].paragraph.elements !== undefined) {
                for (let z = 0; z < content[i].paragraph.elements.length; z++) {
                    if (content[i].paragraph.elements[z].textRun !== undefined && content[i].paragraph.elements[z].textRun.textStyle !== undefined && content[i].paragraph.elements[z].textRun.textStyle.link !== undefined && content[i].paragraph.elements[z].textRun.textStyle.link.url !== undefined && content[i].paragraph.elements[z].textRun.textStyle.link.url.length > 1) {
                        if (content[i].paragraph.elements[z].textRun.textStyle.link.url.includes("https://docs.google.com/document") || content[i].paragraph.elements[z].textRun.textStyle.link.url.includes("https://docs.google.com/spreadsheets") || content[i].paragraph.elements[z].textRun.textStyle.link.url.includes("https://docs.google.com/presentation")) {
                            links.foundLinks.push(content[i].paragraph.elements[z].textRun.textStyle.link.url);
                        }
                    } else if (content[i].paragraph.elements[z].textRun !== undefined && content[i].paragraph.elements[z].textRun.content !== undefined) {
                        for (let string of content[i].paragraph.elements[z].textRun.content.split(" ")) {
                            if (string.includes("https://docs.google.com/document") || string.includes("https://docs.google.com/spreadsheets") || string.includes("https://docs.google.com/presentation")) {
                                links.foundLinks.push(string);
                            }
                        }
                    }
                }
            } else if (content[i].table !== undefined && content[i].table.tableRows !== undefined) {
                for (let z = 0; z < content[i].table.tableRows.length; z++) {
                    if (content[i].table.tableRows[z].tableCells !== undefined) {
                        for (let y = 0; y < content[i].table.tableRows[z].tableCells.length; y++) {
                            if (content[i].table.tableRows[z].tableCells[y].content !== undefined) {
                                for (let b = 0; b < content[i].table.tableRows[z].tableCells[y].content.length; b++) {
                                    if (content[i].table.tableRows[z].tableCells[y].content[b].paragraph !== undefined && content[i].table.tableRows[z].tableCells[y].content[b].paragraph.elements !== undefined) {
                                        for (let c = 0; c < content[i].table.tableRows[z].tableCells[y].content[b].paragraph.elements.length; c++) {
                                            if (content[i].table.tableRows[z].tableCells[y].content[b].paragraph.elements[c].textRun !== undefined && content[i].table.tableRows[z].tableCells[y].content[b].paragraph.elements[c].textRun.textStyle !== undefined && content[i].table.tableRows[z].tableCells[y].content[b].paragraph.elements[c].textRun.textStyle.link !== undefined && content[i].table.tableRows[z].tableCells[y].content[b].paragraph.elements[c].textRun.textStyle.link.url !== undefined && content[i].table.tableRows[z].tableCells[y].content[b].paragraph.elements[c].textRun.textStyle.link.url.length > 1) {
                                                if (content[i].table.tableRows[z].tableCells[y].content[b].paragraph.elements[c].textRun.textStyle.link.url.includes("https://docs.google.com/document/document") || content[i].table.tableRows[z].tableCells[y].content[b].paragraph.elements[c].textRun.textStyle.link.url.includes("https://docs.google.com/spreadsheets") || content[i].table.tableRows[z].tableCells[y].content[b].paragraph.elements[c].textRun.textStyle.link.url.includes("https://docs.google.com/presentation")) {
                                                    // console.log("sd");
                                                    links.foundLinks.push(content[i].table.tableRows[z].tableCells[y].content[b].paragraph.elements[c].textRun.textStyle.link.url);
                                                }
                                            } else if (content[i].table.tableRows[z].tableCells[y].content[b].paragraph.elements[c].textRun !== undefined && content[i].table.tableRows[z].tableCells[y].content[b].paragraph.elements[c].textRun.content !== undefined) {
                                                for (let string of content[i].table.tableRows[z].tableCells[y].content[b].paragraph.elements[c].textRun.content.split(" ")) {
                                                    if (string.includes("https://docs.google.com/document") || string.includes("https://docs.google.com/spreadsheets") || string.includes("https://docs.google.com/presentation")) {
                                                        links.foundLinks.push(string);
                                                        // console.log(string);
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        // console.log(links.foundLinks);
        return links;
    }

    googleApiSlides = async () => {
        let { accessToken, profileObj: { email } } = this.state.googleAuth;

        fetch(`https://www.googleapis.com/drive/v3/files?q=mimeType = 'application/vnd.google-apps.presentation'`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${accessToken}` }
        }).then(res => {
            if (res !== undefined) {
                return res.json();
            }
        }).then(res => {
            if (res !== undefined) {
                let docObjects = []

                let findSlidesCover = (i, afterError) => {
                    this.getSlidesInfo(res.files[i].id, res.files[i].name, afterError)
                        .then(doc => {
                            docObjects.push(doc);
                            this.setState({
                                inSearch: true,
                                tooManyRequests: false
                            });
                            if (docObjects.length === res.files.length) {
                                // console.log(docObjects);
                                return docObjects;
                            }
                        })
                        .then((docObjects) => {
                            // console.log(docObjects);
                            if (docObjects) {
                                for (let doc of docObjects) {
                                    for (let otherDoc of docObjects) {
                                        for (let link of otherDoc.links.foundLinks) {
                                            if (link.includes(`${doc.id}`)) {
                                                // console.log(otherDoc.title);
                                                doc.links.matchedLinksInOtherFiles.push({
                                                    foundInDocTitle: otherDoc.title,
                                                    foundInDocID: otherDoc.id,
                                                    link: otherDoc.type === "document" ? "https://docs.google.com/document/d/" : otherDoc.type === "presentation" ? "https://docs.google.com/presentation/d/" : "https://docs.google.com/spreadsheets/d/"
                                                });
                                            }
                                        }
                                    }
                                }
                                return docObjects;
                            }
                        })
                        .then(docObjects => {
                            if (docObjects) {
                                // console.log(docObjects);

                                let docsLinksFormatted = [];
                                for (let docNew of docObjects) {
                                    let linksArray = [];
                                    // console.log(linksArray);
                                    for (let link of docNew.links.foundLinks) {
                                        // console.log(link);
                                        let type = "";

                                        if (link.includes("https://docs.google.com/presentation")) {
                                            type = "presentation";
                                        } else if (link.includes("https://docs.google.com/document")) {
                                            type = "document";
                                        } else if (link.includes("https://docs.google.com/spreadsheets")) {
                                            type = "spreadsheet";
                                        }

                                        let noFoundCounter = 0;
                                        for (let otherDoc of docObjects) {
                                            // console.log(link);
                                            // console.log(otherDoc);
                                            // console.log(linksArray);
                                            if (link.includes(otherDoc.id)) {
                                                // console.log("athc");

                                                linksArray.push({
                                                    type,
                                                    link,
                                                    linkTitle: otherDoc.title
                                                });
                                            } else {
                                                noFoundCounter++;
                                                if (noFoundCounter === docObjects.length) {
                                                    linksArray.push({
                                                        type,
                                                        link,
                                                    });
                                                }
                                            }
                                        }
                                    }
                                    let formattedDoc = docNew;
                                    formattedDoc.links.foundLinks = linksArray;
                                    docsLinksFormatted.push(formattedDoc);
                                }

                                // console.log(docsLinksFormatted);

                                let ownedDocs = [];
                                for (let doc of docsLinksFormatted) {
                                    if (doc.owner.includes(email)) {
                                        ownedDocs.push(doc);
                                    }
                                }

                                this.setState({
                                    slidesObjects: docsLinksFormatted,
                                    ownedSlidesObjects: ownedDocs,
                                    sortedSlidesObjects: docsLinksFormatted,
                                    inSearch: false,
                                    tooManyRequests: false
                                });

                                console.log("slides done");
                                this.googleApiSheets();
                            }
                        })
                        .catch(err => {
                            console.log(err);
                            this.setState({
                                tooManyRequests: true
                            });
                            setTimeout(() => {
                                findSlidesCover(i);
                            }, Math.random() * 1000 * 5);
                        });
                }

                let docCounter = -1;
                let callForDocs = setInterval(() => {
                    if (docCounter < res.files.length - 1) {
                        docCounter++;
                        // console.log(docCounter);
                        findSlidesCover(docCounter, false);
                    } else if (docCounter === res.files.length - 1) {
                        clearInterval(callForDocs);
                    }
                }, 300);
            }
        })
    }

    googleApiSheets = async () => {
        let { accessToken, profileObj: { email } } = this.state.googleAuth;

        fetch(`https://www.googleapis.com/drive/v3/files?q=mimeType = 'application/vnd.google-apps.spreadsheet'`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${accessToken}` }
        }).then(res => {
            if (res !== undefined) {
                return res.json();
            }
        }).then(res => {
            if (res !== undefined) {
                let docObjects = [];
                let sheetsProccessed = false;

                let findSheetCover = (i, afterError) => {
                    this.getSheetsInfo(res.files[i].id, res.files[i].name, afterError)
                        .then(doc => {
                            docObjects.push(doc);
                            this.setState({
                                inSearch: true,
                                tooManyRequests: false
                            });
                            if (docObjects.length === res.files.length) {
                                // console.log(docObjects);
                                return docObjects;
                            }
                        })
                        .then((docObjects) => {
                            if (docObjects) {
                                sheetsProccessed = true;
                                for (let doc of docObjects) {
                                    for (let otherDoc of docObjects) {
                                        for (let link of otherDoc.links.foundLinks) {
                                            if (link.includes(`${doc.id}`)) {
                                                // console.log(otherDoc.title);
                                                doc.links.matchedLinksInOtherFiles.push({
                                                    foundInDocTitle: otherDoc.title,
                                                    foundInDocID: otherDoc.id,
                                                    link: otherDoc.type === "document" ? "https://docs.google.com/document/d/" : otherDoc.type === "presentation" ? "https://docs.google.com/presentation/d/" : "https://docs.google.com/spreadsheets/d/"
                                                });
                                            }
                                        }
                                    }
                                }
                                return docObjects;
                            }
                        })
                        .then(docObjects => {
                            if (docObjects) {
                                // console.log(docObjects);

                                let docsLinksFormatted = [];
                                for (let docNew of docObjects) {
                                    let linksArray = [];
                                    // console.log(linksArray);
                                    for (let link of docNew.links.foundLinks) {
                                        // console.log(link);
                                        let type = "";

                                        if (link.includes("https://docs.google.com/presentation")) {
                                            type = "slides";
                                        } else if (link.includes("https://docs.google.com/document")) {
                                            type = "docs";
                                        } else if (link.includes("https://docs.google.com/spreadsheets")) {
                                            type = "sheets";
                                        }

                                        let noFoundCounter = 0;
                                        for (let otherDoc of docObjects) {
                                            // console.log(link);
                                            // console.log(otherDoc);
                                            // console.log(linksArray);
                                            if (link.includes(otherDoc.id)) {
                                                // console.log("athc");

                                                linksArray.push({
                                                    type,
                                                    link,
                                                    linkTitle: otherDoc.title
                                                });
                                            } else {
                                                noFoundCounter++;
                                                if (noFoundCounter === docObjects.length) {
                                                    linksArray.push({
                                                        type,
                                                        link,
                                                    });
                                                }
                                            }
                                        }
                                    }
                                    let formattedDoc = docNew;
                                    formattedDoc.links.foundLinks = linksArray;
                                    docsLinksFormatted.push(formattedDoc);
                                }

                                // console.log(docsLinksFormatted);

                                let ownedDocs = [];
                                for (let doc of docsLinksFormatted) {
                                    if (doc.owner.includes(email)) {
                                        ownedDocs.push(doc);
                                    }
                                }

                                this.setState({
                                    sheetObjects: docsLinksFormatted,
                                    ownedSheetObjects: ownedDocs,
                                    sortedSheetObjects: docsLinksFormatted,
                                    inSearch: false,
                                    tooManyRequests: false
                                });

                                console.log("sheets loaded");
                                return "loaded";
                            }
                        })
                        .catch(err => {
                            if (!sheetsProccessed) {
                                console.log("pooper");
                                console.log(err);
                                this.setState({
                                    tooManyRequests: true
                                });
                                setTimeout(() => {
                                    findSheetCover(i, true);
                                }, Math.random() * 1000 * 5);
                            } else {
                                console.error(err);
                            }
                        });
                }

                let docCounter = -1;
                let callForDocs = setInterval(() => {
                    if (docCounter < res.files.length - 1) {
                        docCounter++;
                        // console.log(docCounter);
                        findSheetCover(docCounter, false);
                    } else if (docCounter === res.files.length - 1) {
                        clearInterval(callForDocs);
                    }
                }, 300);
            }
        })
    }

    googleApiDocs = async () => {
        let { accessToken, profileObj: { email } } = this.state.googleAuth;

        fetch(`https://www.googleapis.com/drive/v3/files?q=mimeType = 'application/vnd.google-apps.document'`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${accessToken}` }
        })
            .then(res => res.json())
            .then(res => {
                // console.log(res);
                let docObjects = [];
                let findCover = (i, afterError) => {
                    this.getDocumentInfo(null, res.files[i].id, true, afterError)
                        .then(doc => {
                            docObjects.push(doc);
                            this.setState({
                                inSearch: true,
                                tooManyRequests: false
                            });
                            if (docObjects.length === res.files.length) {
                                // console.log(docObjects);
                                return docObjects;
                            }
                        })
                        .then((docObjects) => {
                            // console.log(docObjects);
                            if (docObjects) {
                                for (let doc of docObjects) {
                                    for (let otherDoc of docObjects) {
                                        if (otherDoc.links.foundLinks !== undefined) {
                                            for (let link of otherDoc.links.foundLinks) {
                                                if (link.includes(`${doc.id}`)) {
                                                    // console.log(otherDoc.title);
                                                    doc.links.matchedLinksInOtherFiles.push({
                                                        foundInDocTitle: otherDoc.title,
                                                        foundInDocID: otherDoc.id,
                                                        link: otherDoc.type === "document" ? "https://docs.google.com/document/d/" : otherDoc.type === "presentation" ? "https://docs.google.com/presentation/d/" : "https://docs.google.com/spreadsheets/d/"
                                                    });
                                                }
                                            }
                                        }

                                    }
                                }
                                return docObjects;
                            }
                        })
                        .then(docObjects => {
                            if (docObjects) {
                                // console.log(docObjects);

                                let docsLinksFormatted = [];
                                for (let docNew of docObjects) {
                                    let linksArray = [];
                                    // console.log(linksArray);
                                    for (let link of docNew.links.foundLinks) {
                                        // console.log(link);
                                        let type = "";

                                        if (link.includes("https://docs.google.com/presentation")) {
                                            type = "slides";
                                        } else if (link.includes("https://docs.google.com/document")) {
                                            type = "docs";
                                        } else if (link.includes("https://docs.google.com/spreadsheets")) {
                                            type = "sheets";
                                        }

                                        let noFoundCounter = 0;
                                        for (let otherDoc of docObjects) {
                                            // console.log(link);
                                            // console.log(otherDoc);
                                            // console.log(linksArray);
                                            if (link.includes(otherDoc.id)) {
                                                // console.log("athc");

                                                linksArray.push({
                                                    type,
                                                    link,
                                                    linkTitle: otherDoc.title
                                                });
                                            } else {
                                                noFoundCounter++;
                                                if (noFoundCounter === docObjects.length) {
                                                    linksArray.push({
                                                        type,
                                                        link,
                                                    });
                                                }
                                            }
                                        }
                                    }
                                    let formattedDoc = docNew;
                                    formattedDoc.links.foundLinks = linksArray;
                                    docsLinksFormatted.push(formattedDoc);
                                }

                                // console.log(docsLinksFormatted);

                                let ownedDocs = [];
                                for (let doc of docsLinksFormatted) {
                                    if (doc.owner.includes(email)) {
                                        ownedDocs.push(doc);
                                    }
                                }

                                this.setState({
                                    docObjects: docsLinksFormatted,
                                    ownedDocObjects: ownedDocs,
                                    sortedDocObjects: docsLinksFormatted,
                                    inSearch: false,
                                    tooManyRequests: false
                                });

                                console.log("docs loaded");
                                this.googleApiSlides();
                            }
                        })
                        .catch(err => {
                            console.log("poop");
                            console.log(err);
                            this.setState({
                                tooManyRequests: true
                            });
                            setTimeout(() => {
                                findCover(i, true);
                            }, Math.random() * 1000 * 5);
                        });
                }
                // console.log(res)
                // for (let i = 0; i < res.files.length; i++) {
                //     console.log(i * 1000);
                //     setTimeout(() => {
                //         findCover(i, false);
                //         console.log(i);
                //         console.log(res.files.length);
                //     }, i * 1);
                // }


                let docCounter = -1;
                let callForDocs = setInterval(() => {
                    if (docCounter < res.files.length - 1) {
                        docCounter++;
                        // console.log(docCounter);
                        findCover(docCounter, false);
                    } else if (docCounter === res.files.length - 1) {
                        clearInterval(callForDocs);
                    }
                }, 50);



                // if (docObjects.length === res.files.length) {
                //     console.log("yes");
                //     return "loaded";
                // }
            })

    }

    getUserDocsList = () => {
        this.setState({
            sortedDocObjects: [],
            inSearch: true
        }, () => {
            this.googleApiDocs();
        });
    }

    getSlidesInfo = async (id, name, error) => {

        // if (!error) {
        //     console.log("slides to search");
        // } else {
        //     console.log("slides to search after error");
        // }

        let { accessToken } = this.state.googleAuth;

        let slideObj = {
            type: "presentation",
            id: id,
            title: name,
            links: {
            },
            modifiedTime: undefined,
            owner: ""
        }

        return fetch(`https://slides.googleapis.com/v1/presentations/${id}?fields=slides.pageElements.shape.text.textElements.textRun.content,slides.pageElements.table.tableRows.tableCells.text.textElements.textRun.content`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${accessToken}` }
        })
            .then(res => res.json())
            .then(res => {
                slideObj.links = this.findSlidesLinks(res);
                return;
            })
            .then(() => {
                return fetch(`https://www.googleapis.com/drive/v3/files/${id}?fields=modifiedTime,owners`, {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${accessToken}` }
                });
            })
            .then(res => res.json())
            .then(res => {
                slideObj.modifiedTime = res.modifiedTime;
                slideObj.owner = res.owners[0].emailAddress;
                return;
            })
            .then(() => {
                // console.log(slideObj);
                return slideObj;
            })
            .catch(err => console.log(err));
    }

    findSlidesLinks = ({ slides }) => {
        let links = {
            foundLinks: [],
            matchedLinksInOtherFiles: []
        }

        if (slides !== undefined) {
            for (let slide of slides) {
                if (slide.pageElements !== undefined) {
                    for (let pageElement of slide.pageElements) {
                        if (pageElement.table !== undefined) {

                        } else if (pageElement.shape !== undefined) {
                            if (pageElement.shape.text !== undefined && pageElement.shape.text.textElements !== undefined) {
                                for (let textElement of pageElement.shape.text.textElements) {
                                    if (textElement.textRun !== undefined && textElement.textRun.content !== undefined) {
                                        if (textElement.textRun.content.includes("https://docs.google.com/document") || textElement.textRun.content.includes("https://docs.google.com/spreadsheets") || textElement.textRun.content.includes("https://docs.google.com/presentation")) {
                                            links.foundLinks.push(textElement.textRun.content);
                                        }
                                    }
                                }
                            }

                        }
                    }
                }
            }
        }


        return links;
    }

    getSheetsInfo = async (id, name, error) => {

        // if (!error) {
        //     console.log("sheets to search");
        // } else {
        //     console.log("sheets to search after error", id);
        // }


        let { accessToken } = this.state.googleAuth;

        let sheetObj = {
            type: "spreadsheet",
            id: id,
            title: name,
            links: {
                foundLinks: [],
                matchedLinksInOtherFiles: []
            },
            modifiedTime: undefined,
            owner: ""
        }

        return fetch(`https://sheets.googleapis.com/v4/spreadsheets/${id}?includeGridData=true&fields=sheets.data.rowData.values.hyperlink`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${accessToken}` }
        })
            .then(res => res.json())
            .then(res => {
                sheetObj.links = this.findSheetsLinks(res);
                return;
            })
            .then(() => {
                return fetch(`https://www.googleapis.com/drive/v3/files/${id}?fields=modifiedTime,owners`, {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${accessToken}` }
                });
            })
            .then(res => res.json())
            .then(res => {
                sheetObj.modifiedTime = res.modifiedTime;
                sheetObj.owner = res.owners[0].emailAddress;
                return;
            })
            .then(() => {
                // console.log(sheetObj);
                return sheetObj;
            })
            .catch(err => {
                console.log(err);
                if (id === '15VXhAPioDOsNRae7c0QpdjVX7a1P4t4rD9IQ9x0NBAo') {
                    return sheetObj;
                }
            });
    }

    findSheetsLinks = ({ sheets }) => {
        let links = {
            foundLinks: [],
            matchedLinksInOtherFiles: []
        }

        if (sheets !== undefined) {
            for (let sheet of sheets) {
                if (sheet.data !== undefined) {
                    for (let content of sheet.data) {
                        if (content.rowData !== undefined) {
                            for (let row of content.rowData) {
                                if (row.values !== undefined) {
                                    for (let value of row.values) {
                                        if (value.hyperlink !== undefined) {
                                            if (value.hyperlink.includes("https://docs.google.com/document") || value.hyperlink.includes("https://docs.google.com/spreadsheets") || value.hyperlink.includes("https://docs.google.com/presentation")) {
                                                links.foundLinks.push(value.hyperlink);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }


        // console.log(links);
        return links;
    }

    handleSearchInputChange = ({ target: { value } }) => {
        if (this.state.inSearch === false) {
            this.setState({
                searchInputValue: value
            })
        }
    }

    handleSearchParametersChange = () => {
        if (this.state.inSearch === false) {
            this.setState(({ searchParametersValue }) => ({
                searchParametersValue: !searchParametersValue
            }));
            this.searchDocs({
                target: {
                    className: "search-btn",
                    key: "Enter",
                    param: true
                }
            });
        }
    }

    searchDocs = (e) => {
        if (this.state.inSearch === false) {
            if (e.key === "Enter" || e.target.className === "search-btn") {
                if (!e.target.param) {
                    e.target.blur();
                }
                this.setState({
                    sortedDocObjects: [],
                    sortedSlidesObjects: [],
                    sortedSheetObjects: [],
                }, () => {
                    let sortedDocs = [];
                    let sortedSlides = [];
                    let sortedSheets = [];
                    if (this.state.searchParametersValue) {
                        for (let doc of this.state.ownedDocObjects) {
                            if (doc.id.toLowerCase().includes(this.state.searchInputValue.toLowerCase()) || doc.title.toLowerCase().includes(this.state.searchInputValue.toLowerCase())) {
                                sortedDocs.push(doc);
                            }
                        }
                        for (let doc of this.state.ownedSlidesObjects) {
                            if (doc.id.toLowerCase().includes(this.state.searchInputValue.toLowerCase()) || doc.title.toLowerCase().includes(this.state.searchInputValue.toLowerCase())) {
                                sortedSlides.push(doc);
                            }
                        }
                        for (let doc of this.state.ownedSheetObjects) {
                            if (doc.id.toLowerCase().includes(this.state.searchInputValue.toLowerCase()) || doc.title.toLowerCase().includes(this.state.searchInputValue.toLowerCase())) {
                                sortedSheets.push(doc);
                            }
                        }
                    } else {
                        for (let doc of this.state.docObjects) {
                            if (doc.id.toLowerCase().includes(this.state.searchInputValue.toLowerCase()) || doc.title.toLowerCase().includes(this.state.searchInputValue.toLowerCase())) {
                                sortedDocs.push(doc);
                            }
                        }
                        for (let doc of this.state.slidesObjects) {
                            if (doc.id.toLowerCase().includes(this.state.searchInputValue.toLowerCase()) || doc.title.toLowerCase().includes(this.state.searchInputValue.toLowerCase())) {
                                sortedSlides.push(doc);
                            }
                        }
                        for (let doc of this.state.sheetObjects) {
                            if (doc.id.toLowerCase().includes(this.state.searchInputValue.toLowerCase()) || doc.title.toLowerCase().includes(this.state.searchInputValue.toLowerCase())) {
                                sortedSheets.push(doc);
                            }
                        }
                    }
                    // console.log(sortedDocs)
                    this.setState(({ searchInputValue: prev }) => ({
                        searchInputValue: '',
                        sortedDocObjects: sortedDocs,
                        sortedSlidesObjects: sortedSlides,
                        sortedSheetObjects: sortedSheets,
                        prevSearchInputValue: prev
                    }));
                });
            }
        }
    }

    clearSearchRequest = () => {
        if (this.state.inSearch === false) {
            this.setState(({ docObjects, searchParametersValue, ownedDocObjects }) => {
                if (searchParametersValue) {
                    return {
                        sortedDocObjects: ownedDocObjects
                    }
                } else {
                    return {
                        sortedDocObjects: docObjects
                    }
                }

            })
        }
    }

    eventsPopup = () => {
        this.setState(({ inSearch }) => ({
            inSearch: !inSearch,
        }));
    }

    render() {
        let { searchInputValue, sortedDocObjects, sortedSlidesObjects, sortedSheetObjects } = this.state;

        const columns = [
            {
                title: 'Title',
                dataIndex: 'fileData',
                filters: [
                    {
                        text: 'document',
                        value: 'document',
                    },
                    {
                        text: 'presentation',
                        value: 'presentation',
                    },
                    {
                        text: 'spreadsheet',
                        value: 'spreadsheet',
                    },
                ],
                render: val => <DocCard doc={val[1]} popUp={false} eventsPopup={this.eventsPopup} />,
                // specify the condition of filtering result
                // here is that finding the name started with `value`
                onFilter: (value, record) => record.fileData.indexOf(value) === 0,
            },
            {
                title: 'Found links',
                dataIndex: 'foundLinks',
                defaultSortOrder: 'descend',
                sorter: (a, b) => a.foundLinks - b.foundLinks,
            },
            {
                title: 'Matched links',
                dataIndex: 'matchedLinks',
                sorter: (a, b) => a.matchedLinks - b.matchedLinks,
            },
        ];

        const data = [];
        // console.log(sortedDocObjects);
        if (sortedDocObjects.length > 0) {
            for (let document of sortedDocObjects) {
                let object = {
                    key: document.id,
                    fileData: [document.type, document],
                    foundLinks: document.links.foundLinks.length,
                    matchedLinks: document.links.matchedLinksInOtherFiles.length
                }
                data.push(object);
            }
        }
        if (sortedSlidesObjects.length > 0) {
            for (let document of sortedSlidesObjects) {
                let object = {
                    key: document.id,
                    fileData: [document.type, document],
                    foundLinks: document.links.foundLinks.length,
                    matchedLinks: document.links.matchedLinksInOtherFiles.length
                }
                data.push(object);
            }
        }
        if (sortedSheetObjects.length > 0) {
            for (let document of sortedSheetObjects) {
                let object = {
                    key: document.id,
                    fileData: [document.type, document],
                    foundLinks: document.links.foundLinks.length,
                    matchedLinks: document.links.matchedLinksInOtherFiles.length
                }
                data.push(object);
            }
        }

        function onChangeTable(pagination, filters, sorter, extra) {
            // console.log('params', pagination, filters, sorter, extra);
        }

        return (
            <>
                <div className="container">
                    {/* <header>
                        <div className="header__container auth">
                            <div className="header-top-row">
                                <div className="header__title">
                                    <h1 className="app-title">docLinks</h1>
                                    <p className="login-section__slogan">
                                        find the linkage between your Google Doc files
                                    </p>
                                </div>
                                {this.props.children}
                            </div>
                            <SearchInput onInput={this.handleSearchInputChange} value={searchInputValue} click={this.searchDocs} />
                            <SearchParameters click={this.handleSearchParametersChange} enabled={searchParametersValue} />
                        </div>
                    </header> */}
                    <header>
                        <div className="header__container auth">
                            <h1 className="app-title">docLinks</h1>
                            <SearchInput onInput={this.handleSearchInputChange} value={searchInputValue} click={this.searchDocs} />
                            <UserAccess avatarLink={this.props.avatarLink}>
                                {this.props.children}
                            </UserAccess>
                        </div>
                    </header>
                    <DocsSection totalFiles={sortedDocObjects.length + sortedSlidesObjects.length + sortedSheetObjects.length}>
                        <Table columns={columns} dataSource={data} onChange={onChangeTable} />
                    </DocsSection>
                </div>
            </>
        )
    }
}

export default MainAuthenticated;