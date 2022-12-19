import { useContext } from 'react';
import { postLogout } from '../../api/auth/methods';
import userContext from '../../contexts/userContext';
import { showLoginModal } from './modalHelper';
import styles from './NavBar.module.scss';

export default function NavBar() {
  const { user, setUser } = useContext(userContext);

  async function handleLogin() {
    showLoginModal().then(({ userInfo, cancelled }) => {
      if (cancelled) return;
      else setUser(userInfo!);
    })
  }

  async function handleLogout() {
    await postLogout();
    setUser(null);
  }

  const userOrLoginEl = (
    user ? <>
        <b>Hi, {user.name}!</b>
        <button onClick={handleLogout}>Logout</button>
      </>
      : <button onClick={handleLogin}>Log in</button>
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
