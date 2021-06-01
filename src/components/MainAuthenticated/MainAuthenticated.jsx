import React, { Component } from 'react';
import './authenticated.css';
import SearchInput from '../SearchInput/SearchInput';
import SearchParameters from '../SearchParameters/SearchParameters';
import MasonryContainer from '../MasonryContainer/MasonryContainer';

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
        }
    }

    getDocumentInfo = async (event, docID = this.state.inputIDtoSearch, findLinks) => {
        let { accessToken } = this.state.googleAuth;
        let docObj = {
            type: "docs",
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
                    if (content[i].paragraph.elements[z].textRun !== undefined && content[i].paragraph.elements[z].textRun.textStyle !== undefined && content[i].paragraph.elements[z].textRun.textStyle.link !== undefined && content[i].paragraph.elements[z].textRun.textStyle.link.url.length > 1) {
                        if (content[i].paragraph.elements[z].textRun.textStyle.link.url.includes("https://docs.google.com")) {
                            links.foundLinks.push(content[i].paragraph.elements[z].textRun.textStyle.link.url);
                        }
                    } else if (content[i].paragraph.elements[z].textRun !== undefined && content[i].paragraph.elements[z].textRun.content !== undefined) {
                        for (let string of content[i].paragraph.elements[z].textRun.content.split(" ")) {
                            if (string.includes("https://docs.google.com")) {
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
                                            if (content[i].table.tableRows[z].tableCells[y].content[b].paragraph.elements[c].textRun !== undefined && content[i].table.tableRows[z].tableCells[y].content[b].paragraph.elements[c].textRun.textStyle !== undefined && content[i].table.tableRows[z].tableCells[y].content[b].paragraph.elements[c].textRun.textStyle.link !== undefined && content[i].table.tableRows[z].tableCells[y].content[b].paragraph.elements[c].textRun.textStyle.link.url.length > 1) {
                                                if (content[i].table.tableRows[z].tableCells[y].content[b].paragraph.elements[c].textRun.textStyle.link.url.includes("https://docs.google.com/document")) {
                                                    // console.log("sd");
                                                    links.foundLinks.push(content[i].table.tableRows[z].tableCells[y].content[b].paragraph.elements[c].textRun.textStyle.link.url);
                                                }
                                            } else if (content[i].table.tableRows[z].tableCells[y].content[b].paragraph.elements[c].textRun !== undefined && content[i].table.tableRows[z].tableCells[y].content[b].paragraph.elements[c].textRun.content !== undefined) {
                                                for (let string of content[i].table.tableRows[z].tableCells[y].content[b].paragraph.elements[c].textRun.content.split(" ")) {
                                                    if (string.includes("https://docs.google.com")) {
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

    getUserDocsList = () => {
        let { accessToken, profileObj: { email } } = this.state.googleAuth;
        this.setState({
            sortedDocObjects: [],
            inSearch: true
        }, () => {
            fetch(`https://www.googleapis.com/drive/v3/files?q=mimeType = 'application/vnd.google-apps.document'`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${accessToken}` }
            })
                .then(res => res.json())
                .then(res => {
                    // console.log(res);
                    let docObjects = [];
                    let findCover = (i) => {
                        this.getDocumentInfo(null, res.files[i].id, true)
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
                                                        foundInDocID: otherDoc.id
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
                                            console.log(link);
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
                                }
                            })
                            .catch(err => {
                                console.log(err);
                                this.setState({
                                    tooManyRequests: true
                                });
                                setTimeout(() => {
                                    findCover(i);
                                }, Math.random() * 1000 * 5);
                            });
                    }
                    // console.log(res)
                    for (let i = 0; i < res.files.length; i++) {
                        findCover(i);


                        // this.getDocumentInfo(null, res.files[i].id, true)
                        //     .then(doc => {
                        //         docObjects.push(doc);
                        //         this.setState({
                        //             inSearch: true,
                        //             tooManyRequests: false
                        //         });
                        //         if (docObjects.length === res.files.length) {
                        //             return docObjects;
                        //         }
                        //     })
                        //     .then((docObjects) => {
                        //         if (docObjects) {
                        //             for (let doc of docObjects) {
                        //                 for (let otherDoc of docObjects) {
                        //                     for (let link of otherDoc.links.foundLinks) {
                        //                         if (link.includes(`https://docs.google.com/document/d/${doc.id}`)) {
                        //                             console.log(otherDoc.title);
                        //                             doc.links.matchedLinksInOtherFiles.push({
                        //                                 foundInDocTitle: otherDoc.title,
                        //                                 foundInDocID: otherDoc.id
                        //                             });
                        //                         }
                        //                     }
                        //                 }
                        //             }
                        //             return docObjects;
                        //         }
                        //     })
                        //     .then(docObjects => {
                        //         if (docObjects) {
                        //             console.log(docObjects);

                        //             let docsLinksFormatted = [];
                        //             for (let docNew of docObjects) {
                        //                 let formattedDoc = docNew;
                        //                 let linksArray = [];
                        //                 for (let link of docNew.links.foundLinks) {
                        //                     console.log(link);
                        //                     for (let otherDoc of docObjects) {
                        //                         console.log(otherDoc.id);
                        //                         if (link.includes(otherDoc.id)) {
                        //                             console.log("athc");
                        //                             console.log(linksArray);
                        //                             linksArray.push({
                        //                                 link,
                        //                                 linkTitle: otherDoc.title
                        //                             })
                        //                         }
                        //                     }
                        //                 }
                        //                 formattedDoc.links.foundLinks = linksArray;
                        //                 docsLinksFormatted.push(formattedDoc);
                        //             }

                        //             console.log(docsLinksFormatted);

                        //             let ownedDocs = [];
                        //             for (let doc of docsLinksFormatted) {
                        //                 if (doc.owner.includes(email)) {
                        //                     ownedDocs.push(doc);
                        //                 }
                        //             }

                        //             this.setState({
                        //                 docObjects: docsLinksFormatted,
                        //                 ownedDocObjects: ownedDocs,
                        //                 sortedDocObjects: docsLinksFormatted,
                        //                 inSearch: false,
                        //                 tooManyRequests: false
                        //             });
                        //         }
                        //     })
                        //     .catch(err => {
                        //         console.log(err);
                        //         this.setState({
                        //             tooManyRequests: true
                        //         });
                        //         setTimeout(() => {
                        //             this.getDocumentInfo(null, res.files[i].id, true)
                        //         }, 1000);
                        //     });
                    }
                })
                .then(() => {
                    return fetch(`https://www.googleapis.com/drive/v3/files?q=mimeType = 'application/vnd.google-apps.spreadsheet'`, {
                        method: 'GET',
                        headers: { 'Authorization': `Bearer ${accessToken}` }
                    })
                })
                .then(res => res.json())
                .then(res => {
                    let docObjects = []

                    let findCover = (i) => {
                        this.getSheetsInfo(res.files[i].id, res.files[i].name)
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
                                                        foundInDocID: otherDoc.id
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
                                            console.log(link);
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
                                }
                            })
                            .catch(err => {
                                console.log(err);
                                this.setState({
                                    tooManyRequests: true
                                });
                                setTimeout(() => {
                                    findCover(i);
                                }, Math.random() * 1000 * 5);
                            });
                    }

                    for (let i = 0; i < res.files.length; i++) {
                        findCover(i);
                    }
                })
                .then(() => {
                    return fetch(`https://www.googleapis.com/drive/v3/files?q=mimeType = 'application/vnd.google-apps.presentation'`, {
                        method: 'GET',
                        headers: { 'Authorization': `Bearer ${accessToken}` }
                    })
                })
                .then(res => res.json())
                .then(res => {
                    let docObjects = []

                    let findCover = (i) => {
                        this.getSlidesInfo(res.files[i].id, res.files[i].name)
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
                                                        foundInDocID: otherDoc.id
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
                                            console.log(link);
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
                                        slidesObjects: docsLinksFormatted,
                                        ownedSlidesObjects: ownedDocs,
                                        sortedSlidesObjects: docsLinksFormatted,
                                        inSearch: false,
                                        tooManyRequests: false
                                    });
                                }
                            })
                            .catch(err => {
                                console.log(err);
                                this.setState({
                                    tooManyRequests: true
                                });
                                setTimeout(() => {
                                    findCover(i);
                                }, Math.random() * 1000 * 5);
                            });
                    }

                    for (let i = 0; i < res.files.length; i++) {
                        findCover(i);
                    }
                })
        })
    }

    getSlidesInfo = async (id, name) => {
        let { accessToken } = this.state.googleAuth;

        let slideObj = {
            type: "slides",
            id: id,
            title: name,
            links: {
            },
            modifiedTime: undefined,
            owner: ""
        }

        return fetch(`https://slides.googleapis.com/v1/presentations/1H7DMy0PYzuXGJO6kXTVx_DfJakUFQ2hz0t8sMvnijHM?fields=slides.pageElements.shape.text.textElements.textRun.content,slides.pageElements.table.tableRows.tableCells.text.textElements.textRun.content`, {
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
                console.log(slideObj);
                return slideObj;
            });
    }

    findSlidesLinks = ({ slides }) => {
        let links = {
            foundLinks: [],
            matchedLinksInOtherFiles: []
        }

        for (let slide of slides) {
            for (let pageElement of slide.pageElements) {
                if (pageElement.table !== undefined) {

                } else if (pageElement.shape !== undefined) {
                    for (let textElement of pageElement.shape.text.textElements) {
                        if (textElement.textRun !== undefined && textElement.textRun.content !== undefined) {
                            if (textElement.textRun.content.includes("https://docs.google.com")) {
                                links.foundLinks.push(textElement.textRun.content);
                            }
                        }
                    }
                }
            }
        }

        return links;
    }

    getSheetsInfo = async (id, name) => {
        let { accessToken } = this.state.googleAuth;

        let sheetObj = {
            type: "sheets",
            id: id,
            title: name,
            links: {
            },
            modifiedTime: undefined,
            owner: ""
        }

        return fetch(`https://sheets.googleapis.com/v4/spreadsheets/${id}?includeGridData=true`, {
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
                return sheetObj;
            });
    }

    findSheetsLinks = ({ sheets }) => {
        let links = {
            foundLinks: [],
            matchedLinksInOtherFiles: []
        }

        for (let sheet of sheets) {
            for (let content of sheet.data) {
                for (let row of content.rowData) {
                    if (row.values !== undefined) {
                        for (let value of row.values) {
                            if (value.hyperlink !== undefined) {
                                if (value.hyperlink.includes("https://docs.google.com")) {
                                    links.foundLinks.push(value.hyperlink);
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
                    sortedDocObjects: []
                }, () => {
                    let sortedDocs = [];
                    if (this.state.searchParametersValue) {
                        for (let doc of this.state.ownedDocObjects) {
                            if (doc.id.toLowerCase().includes(this.state.searchInputValue.toLowerCase()) || doc.title.toLowerCase().includes(this.state.searchInputValue.toLowerCase())) {
                                sortedDocs.push(doc);
                            }
                        }
                    } else {
                        for (let doc of this.state.docObjects) {
                            if (doc.id.toLowerCase().includes(this.state.searchInputValue.toLowerCase()) || doc.title.toLowerCase().includes(this.state.searchInputValue.toLowerCase())) {
                                sortedDocs.push(doc);
                            }
                        }
                    }
                    // console.log(sortedDocs)
                    this.setState(({ searchInputValue: prev }) => ({
                        searchInputValue: '',
                        sortedDocObjects: sortedDocs,
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
        let { searchInputValue, searchParametersValue, sortedDocObjects, prevSearchInputValue, docObjects, tooManyRequests, ownedDocObjects } = this.state;

        return (
            <>
                <div className="container">
                    <header>
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
                    </header>
                    <div className="docs-section">
                        {tooManyRequests ? <p className="result-title">You've exceeded the requests limit per user!{console.log('Loading...')}</p> : <>{sortedDocObjects[0] ? <><MasonryContainer docs={sortedDocObjects} eventsPopup={this.eventsPopup}>{sortedDocObjects.length === docObjects.length || sortedDocObjects.length === ownedDocObjects.length ? null : <div className="result-title">Results for: {prevSearchInputValue}<span onClick={this.clearSearchRequest}>Clear search request</span></div>}</MasonryContainer></> : <p className="result-title">Loading{console.log('Loading...')}</p>}</>}
                    </div>
                </div>
            </>
        )
    }
}

export default MainAuthenticated;