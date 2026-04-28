import "./AboutLTU.css";
import ltuLogo from "../assets/LTU Ice Cubes.png";

function AboutLTU() {
  return (
    <div id="ltu">
      <img
        src={String(ltuLogo)}
        alt="LTU Logo"
      />
      <div>
        This application was sponsored by<br />
        Luleå University of Technology<br />
        and the individuals behind the proposal:
        <div>Elisa Barney Smith</div>
        <div>Stephan Unter</div>
        <div>Gayan Pathirage</div>
        For information about LTU, visit<br />
        <a
          href="https://www.ltu.se/en"
          target="_blank"
          rel="noreferrer"
        >
          https://www.ltu.se/en
        </a>
      </div>
    </div>
  );
}

export default AboutLTU;
