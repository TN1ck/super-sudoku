import * as React from 'react';
import {Link} from 'react-router-dom';
import Grid from 'src/components/modules/Grid';

import './Footer.scss';

const FOOTER_LINKS = [
  {
    name: 'Challenge',
    link: '/challenge',
  },
  {
    name: 'About',
    link: '/about',
  },
  {
    name: 'Login',
    link: '/login',
  },
];

const Footer: React.StatelessComponent<{}> = () => {
  return (
    <footer className="ss_footer">
      <Grid.Grid>
        <Grid.Row middle="xs" between="xs">
          <Grid.Col>
            <div className="ss_footer-logo">
              <img src='' />
            </div>
          </Grid.Col>
          <Grid.Col>
            {FOOTER_LINKS.map(({name, link}) => {
              return (
                <Link to={link} key={name} className="ss_footer-btn">
                  {name}
                </Link>
              );
            })}
          </Grid.Col>
        </Grid.Row>
      </Grid.Grid>
    </footer>
  );
};

export default Footer;
