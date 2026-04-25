import { useState } from "react";
import "./AboutButton.css";

function AboutButton() {
  const [visible, setVisible] = useState(false);

  return (
    <div id="sdp">
      <img
        src="src/assets/sdp-logo.png"
        alt="senior design project logo"
        onMouseOver={() => setVisible(true)}
      />
      <div
        className={visible ? "visible" : ""}
        onMouseLeave={() => setVisible(false)}
      >
        This website was created for a<br />
        Boise State University<br />
        Computer Science Senior Design Project by
        <div>James Maloney</div>
        <div>Mason Swanson</div>
        <div>Porter Rigby</div>
        For information about sponsoring a project go to<br />
        <a
          href="https://www.boisestate.edu/coen-cs/community/cs481-senior-design-project/"
          target="_blank"
          rel="noreferrer"
        >
          https://www.boisestate.edu/coen-cs/community/cs481-senior-design-project/
        </a>
      </div>
    </div>
  );
}

export default AboutButton;
