import { useCallback, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { styled } from '@mui/material/styles';
import { withAuthGuard } from 'src/hocs/with-auth-guard';
import { SideNav } from './side-nav';
import { TopNav } from './top-nav';
import { useBearStore } from 'src/contexts/store';
import ProfileSetup from './profile-setup';
import { useRouter } from 'next/router';
import io from 'socket.io-client';
import { configs } from 'src/config-variables';
// import { configs } from 'src/config-variables';

const SIDE_NAV_WIDTH = 280;

const LayoutRoot = styled('div')(({ theme }) => ({
  display: 'flex',
  flex: '1 1 auto',
  maxWidth: '100%',
  [theme.breakpoints.up('lg')]: {
    paddingLeft: SIDE_NAV_WIDTH
  }
}));

const LayoutContainer = styled('div')({
  display: 'flex',
  flex: '1 1 auto',
  flexDirection: 'column',
  width: '100%'
});

export const Layout = withAuthGuard((props) => {
  const { children } = props;
  const userObj = useBearStore((state) => state.user);
  const router = useRouter();
  const pathname = usePathname();
  const [openNav, setOpenNav] = useState(false);
  const [socket, setSocket] = useState(null); // State for Socket.IO instance

  // Initialize Socket.IO connection when component mounts
  useEffect(() => {
    const newSocket = io(configs.baseSocket); // Replace with your Socket.IO server URL
    setSocket(newSocket);
    return () => newSocket.close(); // Close socket connection when component unmounts
  }, []);
  useEffect(() => {
    if (socket) {
      console.log("listeneing on new event")
      socket.on('abc', (data) => {
        console.log('New appointment created with ID:', data);
      });
    }
  }, [socket]);

  if (!userObj) {
    router.replace("/auth/login");
  }

  const handlePathnameChange = useCallback(
    () => {
      if (openNav) {
        setOpenNav(false);
      }
    },
    [openNav]
  );

  useEffect(() => {
    handlePathnameChange();
  }, [pathname]);

  return (
    <>
      <TopNav onNavOpen={() => setOpenNav(true)} />
      <SideNav onClose={() => setOpenNav(false)} open={openNav} />
      <LayoutRoot>
        <LayoutContainer>
          {userObj?.role ? children : <ProfileSetup />}
        </LayoutContainer>
      </LayoutRoot>
    </>
  );
});
