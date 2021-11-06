import React, { useEffect, useState } from 'react';
import { Redirect, Route } from 'react-router-dom';
import { verifyToken } from './Common';

export function PrivateRoute({ component: Compontent, path, roles, ...rest }: any) {

  const [auth, setAuth] = useState(true);
  const [goOn, setGoOn] = useState(false);
  const [user, setUser] = useState({
    firstname: 'Test',
    lastname: 'Test'
  });

  // useEffect(() => {
  //   verifyToken()
  //     .then((res: any) => {
  //       setAuth(res.status);
  //       if (res.data)
  //         setUser(res.data.user)
  //     })
  //     .then(() => {
  //       setGoOn(true);
  //     })
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  // if (!goOn) {
  //   return (
  //     <div>Loading...</div>
  //   )
  // }

  let res;

  if (auth) {
    // @ts-ignore
    if ((roles && roles.includes(user.role)) || !roles)
      res = <Route {...rest} render={props => <Compontent path={props.location.pathname} user={user} {...props} />} />
    else
      res = <Route {...rest} render={props => <Redirect to={{ pathname: '/', state: { from: props.location } }} />} />
  } else {
    res = <Route {...rest} render={props => <Redirect to={{ pathname: '/login', state: { from: props.location } }} />} />
  }

  return res;
}