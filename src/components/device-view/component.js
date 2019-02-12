class Component {
    deviceUpdating(data) {
        this.getComponent('info').setState('status', data.status);
    }
}

module.exports = Component;
