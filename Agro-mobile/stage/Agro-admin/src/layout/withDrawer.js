import React from "react";
import Drawer from "./Drawer";

const withDrawer = (WrappedComponent) => {
  return class extends React.Component {
    render() {
      return (
        <React.Fragment>
          <Drawer child={<WrappedComponent {...this.props} />} />
        </React.Fragment>
      );
    }
  };
};

export default withDrawer;
