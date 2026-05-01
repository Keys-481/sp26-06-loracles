import "./LTUButton.css";
import ltuLogo from "../assets/ltu_logo-blue-white.png";

function LTUButton() {
  return (
    <div id="sdp">
      <img
        src={String(ltuLogo)}
        alt="Luleå Tekniska Universitet logo"
      />
      <div>
        This application was sponsored by<br />
        Luleå Tekniska Universitet<br />
      </div>
    </div>
  );
}

export default LTUButton;
