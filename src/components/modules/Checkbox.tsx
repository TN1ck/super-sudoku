import styled from 'styled-components';

const Checkbox = styled.input`
  position: relative;
  top: -0.375rem;
  margin: 0 1rem 0 0;
  cursor: pointer;

  &:before {
    -webkit-transition: all 0.3s ease-in-out;
    -moz-transition: all 0.3s ease-in-out;
    transition: all 0.3s ease-in-out;
    content: "";
    position: absolute;
    left: 0;
    z-index: 1;
    width: 1rem;
    height: 1rem;
    border: 2px solid #f2f2f2;

    &:checked {
      -webkit-transform: rotate(-45deg);
      -moz-transform: rotate(-45deg);
      -ms-transform: rotate(-45deg);
      -o-transform: rotate(-45deg);
      transform: rotate(-45deg);
      height: .5rem;
      border-color: #009688;
      border-top-style: none;
      border-right-style: none;
    }
  }

  :after {
    content: "";
    position: absolute;
    top: -0.125rem;
    left: 0;
    width: 1.1rem;
    height: 1.1rem;
    background: #fff;
    cursor: pointer;
  }
`;

export default Checkbox;
