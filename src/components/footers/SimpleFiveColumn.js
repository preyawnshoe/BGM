import React from "react";
import tw from "twin.macro";
import styled from "styled-components";
import { css } from "styled-components/macro"; //eslint-disable-line

import { ReactComponent as FacebookIcon } from "../../images/facebook-icon.svg";
import { ReactComponent as TwitterIcon } from "../../images/twitter-icon.svg";
import { ReactComponent as YoutubeIcon } from "../../images/youtube-icon.svg";
import { ReactComponent as LinkedInIcon } from "../../images/linkedin-icon.svg";

const Container = tw.div`relative bg-gray-200 -mx-8 -mb-8 px-8`;
const SocialFooter = tw.div`max-w-screen-xl mx-auto py-12 flex flex-col items-center justify-center`;

const SocialLinksContainer = tw.div`flex items-center justify-center space-x-6`;
const SocialLink = styled.a`
  ${tw`cursor-pointer inline-block p-3 rounded-full bg-gray-700 text-gray-100 hover:bg-primary-500 hover:scale-110 transition duration-300`}
  svg {
    ${tw`w-6 h-6`}
  }
`;

const CopyrightText = tw.p`mt-6 text-sm text-gray-600 text-center`;

export default () => {
  return (
    <Container>
      <SocialFooter>
        <SocialLinksContainer>
          <SocialLink href="https://facebook.com" aria-label="Facebook">
            <FacebookIcon />
          </SocialLink>
          <SocialLink href="https://twitter.com" aria-label="Twitter">
            <TwitterIcon />
          </SocialLink>
          <SocialLink href="https://linkedin.com" aria-label="LinkedIn">
            <LinkedInIcon />
          </SocialLink>
          <SocialLink href="https://youtube.com" aria-label="YouTube">
            <YoutubeIcon />
          </SocialLink>
        </SocialLinksContainer>
        <CopyrightText>
          © 2026 BITSAA Global Meet. All rights reserved.
        </CopyrightText>
      </SocialFooter>
    </Container>
  );
};
