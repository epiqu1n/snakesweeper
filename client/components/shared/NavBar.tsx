import { useContext } from 'react';
import { postLogout } from '../../api/auth/methods';
import userContext from '../../contexts/userContext';
import { showLoginModal, showSignupModal } from './modalHelper';
import styles from './NavBar.module.scss';

export default function NavBar() {
  const { user, setUser } = useContext(userContext);

  async function handleLoginClick() {
    showLoginModal().then(({ userInfo, cancelled }) => {
      if (cancelled || !userInfo) return;
      else setUser(userInfo);
    });
  }

  async function handleSignupClick() {
    showSignupModal().then(({ userInfo, cancelled }) => {
      if (cancelled || !userInfo) return;
      else setUser(userInfo);
    });
  }

  async function handleLogoutClick() {
    await postLogout();
    setUser(null);
  }

  const userOrLoginEl = (
    user ? <>
      <b>Hi, {user.name}!</b>
      <button onClick={handleLogoutClick}>Logout</button>
    </>
    : <>
      <button onClick={handleLoginClick}>Log in</button>
      <button onClick={handleSignupClick}>Sign up</button>
    </>
  );

  return (
    <nav className={styles.navBar}>
      <div className={styles.left}>

      </div>
      <div className={styles.center}>
        <h1>Snakesweeper</h1>
      </div>
      <div className={styles.right}>
        {userOrLoginEl}
      </div>
    </nav>
  );
}
