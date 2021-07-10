import React from 'react';
import { Tooltip } from 'antd';

const UserAccess = (props) => (
    <div className="user-access">
        <Tooltip 
        title="The purpose of this app is to help you find external 
        links to other Google 
        Drive files that your documents contain"
        placement="bottomRight"
        arrowPointAtCenter={true}
        >
            <img alt="" src="/question-mark-circle.svg" />
        </Tooltip>
        <Tooltip 
        title={props.children}
        placement="bottomRight"
        arrowPointAtCenter={true}
        >
            <img alt="" src={props.avatarLink} className="user-avatar" />
        </Tooltip>
    </div>
);

export default UserAccess;