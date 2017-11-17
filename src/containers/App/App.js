// @flow
// global localStorage, window
import * as React from "react";
import { connect } from "react-redux";
import { Route, Redirect, Switch } from "react-router-dom";
import { Helmet } from "react-helmet";
import Header from "components/Header";
import Footer from "components/Footer";
import Menu from "components/Menu";
import Modal from "components/Modal";
import Login from "routes/Login";
import Signup from "routes/Signup";
import About from "routes/About";
import Faq from "routes/Faq";
import Transfer from "routes/Transfer";
import Transactions from "routes/Transactions";
import Users from "routes/Users";
import Profile from "routes/Profile";
import Accounts from "routes/Accounts";
import EditProfile from "routes/EditProfile";
import NoMatch from "routes/NoMatch";
import { toggleMenu, closeMenu } from "./reducer";
import { doLogout } from "../../thunks/login";

import "./App.scss";

const RoutesAuthenticated = ({ isAuthenticated, location }) =>
  !isAuthenticated ? (
    <Redirect to="/login" />
  ) : (
    [
      <Route path="/" exact component={Transfer} key="transfer" />,
      <Route
        path="/transactions"
        component={Transactions}
        key="transactions"
      />,
      <Route path="/users" component={Users} key="users" />,
      <Route path="/user/:id" component={Profile} key="user" />,
      <Route path="/accounts" component={Accounts} key="accounts" />,
      <Route path="/profile" component={EditProfile} key="profile" />
    ]
  );

const renderModalRoutes = props => (
  <Switch>
    <Redirect from="/create-account" to="/signup" />
    <Redirect from="/connect-account" to="/accounts" />
    <Route path="/login" render={() => <Login {...props} />} />
    <Route path="/signup" component={() => <Signup {...props} />} />
  </Switch>
);

const modalRoutes = ["/login", "/signup", "/create-account"];

type Props = {
  history: any,
  location: any,
  isMenuOpen: boolean,
  isAuthenticated: boolean,
  handleClickMenu: () => mixed,
  handleClickMenuClose: () => mixed,
  onLogout: () => mixed
};

type LocationType = {
  pathname: string,
  hash: string,
  search: string
};

class App extends React.Component<Props> {
  previousLocation: LocationType;
  unauthLocation: LocationType;

  constructor(props, context) {
    super(props, context);

    /* eslint-disable */
    this.previousLocation = this.unauthLocation = {
      pathname: "/about",
      hash: "",
      search: ""
    };
    /* eslint-enable */
  }

  componentWillUpdate(nextProps) {
    const {
      history: { location } = { location: window.location },
      isAuthenticated
    } = this.props;

    if (
      nextProps.history.action !== "POP" &&
      (!location.state || !location.state.modal)
    ) {
      this.previousLocation = isAuthenticated
        ? this.props.location
        : this.unauthLocation;
    }
  }

  handleModalClose() {
    const { history } = this.props;
    history.push(this.previousLocation);
    console.log("closing");
  }

  render() {
    const {
      handleClickMenu,
      handleClickMenuClose,
      history: { location } = { location: window.location },
      isAuthenticated,
      isMenuOpen,
      onLogout
    } = this.props;
    const handleModalClose = this.handleModalClose.bind(this);
    const isModalOpen = modalRoutes.some(path =>
      new RegExp(path).test(location.pathname)
    );

    return (
      <main className={`${isMenuOpen ? "open" : "closed"}`}>
        <Helmet titleTemplate="%s | EOS Wallet" defaultTitle="EOS Wallet" />

        <Header
          isAuthenticated={isAuthenticated}
          onClick={handleClickMenu}
          onLogout={onLogout}
        />

        <div className="wrapper">
          <aside className="sidebar">
            <Menu isAuthenticated={isAuthenticated} />
          </aside>

          <section className={`body ${isMenuOpen ? "open" : "closed"}`}>
            <div
              onClick={handleClickMenuClose}
              className="menu-closer"
              role="button"
              tabIndex="0"
            />

            <Switch location={isModalOpen ? this.previousLocation : location}>
              <Route path="/about" component={About} />
              <Route path="/faq" component={Faq} />
              <RoutesAuthenticated isAuthenticated={isAuthenticated} />
              <Route path="*" component={NoMatch} />
            </Switch>

            <Footer />
          </section>
        </div>

        <Modal
          isOpen={isModalOpen}
          handleClose={handleModalClose}
          renderRoute={renderModalRoutes}
        />
      </main>
    );
  }
}

const mapStateToProps = ({
  app: { isMenuOpen },
  login: { isAuthenticated }
}) => ({
  isAuthenticated,
  isMenuOpen
});

const mapDispatchToProps = dispatch => ({
  handleClickMenu() {
    dispatch(toggleMenu());
  },
  handleClickMenuClose() {
    dispatch(closeMenu());
  },
  onLogout: () => dispatch(doLogout())
});

const AppContainer = connect(mapStateToProps, mapDispatchToProps)(App);

export default AppContainer;
