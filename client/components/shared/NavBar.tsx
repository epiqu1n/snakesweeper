import { useContext } from 'react';
import { postLogin } from '../../api/auth/methods';
import userContext from '../../contexts/userContext';
import { InputFields } from './InputModal';
import showFormModal from './modalHelper';
import styles from './NavBar.module.scss';

export default function NavBar() {
  const { user, setUser } = useContext(userContext);

  async function showLoginModal() {
    const { response, cancelled } = await showFormModal(
      'Log in',
      {
      'username': {},
      'password': { type: "password" }
      },
      async (values) => await postLogin(values)
    );
    
    if (cancelled) return;
    console.debug('Logging in - psych!')
    console.debug(response);
  }

  return (
    <nav className={styles.navBar}>
      <div className={styles.left}>

      </div>
      <div className={styles.center}>
        <h1>Snakesweeper</h1>
      </div>
      <div className={styles.right}>
        {
          user ? <button onClick={() => setUser(null)}>{user.username}</button>
          : <button onClick={showLoginModal}>Log in</button>
        }
      </div>
    </nav>
  );
}
