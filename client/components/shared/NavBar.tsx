import { useContext } from 'react';
import { postLogin, postLogout } from '../../api/auth/methods';
import userContext from '../../contexts/userContext';
import showFormModal from './modalHelper';
import styles from './NavBar.module.scss';

export default function NavBar() {
  const { user, setUser } = useContext(userContext);

  async function showLoginModal() {
    const { response, cancelled } = await showFormModal(
      <h3>Log in</h3>,
      {
      'username': {},
      'password': { type: "password" }
      },
      postLogin
    );
    
    if (cancelled) return;
    else setUser(response!);
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
      : <button onClick={showLoginModal}>Log in</button>
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
