import React, { Component } from 'react';
import './DocCard.css';
import { Modal } from 'antd';

class DocCard extends Component {
    state = {
        doc: this.props.doc,
        title: this.props.doc.title,
        loading: false,
        visible: false,
    }

    showModal = (e) => {
        e.preventDefault();
        this.setState({
            visible: true,
        });
    };

    handleOk = () => {
        this.setState({ loading: true });
        setTimeout(() => {
            this.setState({ loading: false, visible: false });
        }, 3000);
    };

    handleCancel = () => {
        this.setState({ visible: false });
    };

    render() {
        const { title, doc, visible = this.state } = this.state;
        let time = new Date(doc.modifiedTime).toLocaleString('en-GB', { timeZone: 'UTC' });
        const docLink = doc.type === "document" ? "https://docs.google.com/document/d/" : doc.type === "presentation" ? "https://docs.google.com/presentation/d/" : "https://docs.google.com/spreadsheets/d/";

        return (
            <>
                <div className="table-doc-title-wrap">
                    <img alt="" src={doc.type === "document" ? "/Docs.svg" : doc.type === "presentation" ? "/Slides.svg" : "Sheets.svg"}></img>
                    <a href="" onClick={this.showModal}>{title}</a>
                    <Modal
                        visible={visible}
                        title={<a href={`${docLink}${doc.id}`} target="_blank" rel="noreferrer">{title}</a>}
                        onOk={this.handleOk}
                        onCancel={this.handleCancel}
                        width={850}
                        footer={[]}
                    >
                        <div className="popup__stats">
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
                                    <a key={link.link + Math.random()} href={link.link} className="popup__link" target="_blank" rel="noreferrer">{link.link.includes("document") ? <img alt="" src="/Docs.svg" className="link-image" /> : link.link.includes("presentation") ? <img alt="" src="/Slides.svg" className="link-image" /> : <img alt="" src="/Sheets.svg" className="link-image" />}{link.linkTitle ? link.linkTitle : link.link}</a>
                                ))}
                            </div>
                            <div className="popup__links__column">
                                <h4 className="popup__links__title">Found in files:</h4>
                                {doc.links.matchedLinksInOtherFiles.map((item) => (
                                    <a key={item.foundInDocID + Math.random()} href={`${item.link}${item.foundInDocID}`} className="popup__link" target="_blank" rel="noreferrer">{item.link.includes("document") ? <img alt="" src="/Docs.svg" className="link-image" /> : item.link.includes("presentation") ? <img alt="" src="/Slides.svg" className="link-image" /> : <img alt="" src="/Sheets.svg" className="link-image" />}{item.foundInDocTitle}</a>
                                ))}
                            </div>
                        </div>
                    </Modal>
                </div>
            </>
        )
    }
}

export default DocCard;