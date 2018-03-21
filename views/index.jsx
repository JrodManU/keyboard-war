const React = require('react');
const DefaultLayout = require('./layouts/defaultLayout');

class Welcome extends React.Component {
  render() {
    return (
      <DefaultLayout>
        <h1>{this.props.text}</h1>
      </DefaultLayout>
    );
  }
}

module.exports = Welcome;
