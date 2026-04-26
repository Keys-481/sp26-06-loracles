import "./AboutSDP.css";

function AboutSDP() {
  return (
    <div id="sdp">
      <img
        src="src/assets/sdp-logo.png"
        alt="senior design project logo"
      />
      <div>
        This application was created as a<br />
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

export default AboutSDP;
