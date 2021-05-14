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
                console.log(docObj);
                return docObj;
            })
    }

    findDocumentLinks = (content, docID) => {
        let links = {
            foundLinks: [],
            matchedLinksInOtherFiles: []
        }
        for (let i = 0; i < content.length; i++) {
            if (content[i].paragraph !== undefined && content[i].paragraph.elements !== undefined) {
                for (let z = 0; z < content[i].paragraph.elements.length; z++) {
                    if (content[i].paragraph.elements[z].textRun !== undefined && content[i].paragraph.elements[z].textRun.textStyle !== undefined && content[i].paragraph.elements[z].textRun.textStyle.link !== undefined) {
                        if (content[i].paragraph.elements[z].textRun.textStyle.link.url.includes("https://docs.google.com/document/d")) {
                            links.foundLinks.push(content[i].paragraph.elements[z].textRun.textStyle.link.url);
                        }
                    } else if (content[i].paragraph.elements[z].textRun !== undefined && content[i].paragraph.elements[z].textRun.content !== undefined) {
                        for (let string of content[i].paragraph.elements[z].textRun.content.split(" ")) {
                            if (string.includes("https://docs.google.com/document/d/")) {
                                links.foundLinks.push(string);
                            }
                        }
                    }
                }
            }
        }
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
                                    return docObjects;
                                }
                            })
                            .then((docObjects) => {
                                if (docObjects) {
                                    for (let doc of docObjects) {
                                        for (let otherDoc of docObjects) {
                                            for (let link of otherDoc.links.foundLinks) {
                                                if (link.includes(`https://docs.google.com/document/d/${doc.id}`)) {
                                                    console.log(otherDoc.title);
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
                                    console.log(docObjects);

                                    let docsLinksFormatted = [];
                                    for (let docNew of docObjects) {
                                        let formattedDoc = docNew;
                                        let linksArray = [];
                                        for (let link of docNew.links.foundLinks) {
                                            console.log(link);
                                            for (let otherDoc of docObjects) {
                                                console.log(otherDoc.id);
                                                if (link.includes(otherDoc.id)) {
                                                    console.log("athc");
                                                    console.log(linksArray);
                                                    linksArray.push({
                                                        link,
                                                        linkTitle: otherDoc.title
                                                    })
                                                }
                                            }
                                        }
                                        formattedDoc.links.foundLinks = linksArray;
                                        docsLinksFormatted.push(formattedDoc);
                                    }

                                    console.log(docsLinksFormatted);

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
                                }, 500);
                            });
                    }
                    console.log(res)
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
                });
        })
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
                    console.log(sortedDocs)
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