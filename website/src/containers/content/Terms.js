import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Grid, Row, Col } from 'react-bootstrap';
import { Footer3v, LandingNavigationV2, LandingHeader } from '../../components';
import { DefaultHelmet } from '../../helpers';
import landingPageData from '../../landingv2-data.json';
import styles from './static.module.scss';

export default class Terms extends Component {

  constructor(props, context) {
    super(props, context);
  }

  render() {
    return (
      <div className={styles['full-height']}>
        <DefaultHelmet />
        <LandingNavigationV2 data={landingPageData}/>
        <div className={styles['page-wrap']}>
        <LandingHeader image={'images/pricing_hero_1.png'} header='TERMS OF SERVICE AGREEMENT'
                       description=''/>
        <Grid>
          <Row>
            <Col md={12}>
              <div className={styles.TOSCotentContainer}>
                <p>Our terms are intended to define our superior service and compliance with anti-spam regulations. By using Arrivy, you are agreeing to be bound by the policies stated therein. We recommend you take a few moments and have a read through.</p>
                <h3>Privacy Policy</h3>
                <p><a href='/privacy'>Read full Privacy Policy here</a></p>
                <h3>Anti-Spam Policy</h3>
                <p><a href='/antispam'>Read full Anti-Spam Policy here</a></p>
                <p>&nbsp;</p>
                <p><em>PLEASE READ THE FOLLOWING TERMS OF SERVICE AGREEMENT CAREFULLY. BY ACCESSING OR USING OUR SITES AND OUR SERVICES, YOU HEREBY AGREE TO BE BOUND BY THE TERMS AND ALL TERMS INCORPORATED HEREIN BY REFERENCE. IT IS THE RESPONSIBILITY OF YOU, THE USER, CUSTOMER, OR PROSPECTIVE CUSTOMER TO READ THE TERMS AND CONDITIONS BEFORE PROCEEDING TO USE THIS SITE. IF YOU DO NOT EXPRESSLY AGREE TO ALL OF THE TERMS AND CONDITIONS, THEN PLEASE DO NOT ACCESS OR USE OUR SITES OR OUR SERVICES. THIS TERMS OF SERVICE AGREEMENT IS EFFECTIVE AS OF 09/16/2016.</em></p>
                <p>&nbsp;</p>
                <h4>ACCEPTANCE OF TERMS</h4>
                <p>&nbsp;</p>
                <p>The following Terms of Service Agreement (the "TOS") is a legally binding agreement that shall govern the relationship with our users and others which may interact or interface with Arrivy, Inc., also known as Arrivy, located at 10400 NE 4th St Bellevue WA 98004 and our subsidiaries and affiliates, in association with the use of the Arrivy website, which includes www.arrivy.com, (the "Site") and its Services, which shall be defined below.</p>
                <p>&nbsp;</p>
                <p><strong>DESCRIPTION OF WEBSITE SERVICES OFFERED</strong></p>
                <p>&nbsp;</p>
                <p>Arrivy platform enables Service companies to connect with their client in real-time and provide them with engaging service experience and it also allows them to connect their service teams in real-time.</p>
                <p>&nbsp;</p>
                <p>Any and all visitors to our site, despite whether they are registered or not,&nbsp;shall be deemed as "users" of the herein contained Services provided for the purpose of this TOS.&nbsp;Once an individual register's for our Services, through the process of creating an account, the user shall then be considered a "member."</p>
                <p>&nbsp;</p>
                <p>The user&nbsp;and/or member&nbsp;acknowledges and agrees that the Services provided and made available through our website and applications, which may include some mobile applications and that those applications may be made available on various social media networking sites and numerous other platforms and downloadable programs, are the sole property of&nbsp;Arrivy.&nbsp;At its discretion, Arrivy may offer additional website Services and/or products, or update, modify or revise any current content and Services, and this Agreement shall apply to any and all additional Services and/or products and any and all updated, modified or revised Services unless otherwise stipulated. Arrivy does hereby reserve the right to cancel and cease offering any of the aforementioned Services and/or products. You, as the end user&nbsp;and/or member,&nbsp;acknowledge, accept and agree that Arrivy shall not be held liable for any such updates, modifications, revisions, suspensions or discontinuance of any of our Services and/or products. Your continued use of the Services provided, after such posting of any updates, changes, and/or modifications shall constitute your acceptance of such updates, chang</p>
                <p>&nbsp;</p>
                <p><strong>REGISTRATION</strong></p>
                <p>&nbsp;</p>
                <p>To register and become a "member" of the Site, you must be at least 18 years of age to enter into and form a legally binding contract. In addition, you must be in good standing and not an individual that has been previously barred from receiving Arrivy's Services under the laws and statutes of the United States or other applicable jurisdiction.</p>
                <p>&nbsp;</p>
                <p>When you register, Arrivy may collect information such as your name, e-mail address, business address, occupation, and industry.&nbsp;You can edit your account information at any time. Once you register with Arrivy and sign in to our Services, you are no longer anonymous to us.</p>
                <p>&nbsp;</p>
                <p>Furthermore, the registering party hereby acknowledges, understands and agrees to:</p>
                <p>&nbsp;</p>
                <p>a)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;furnish factual, correct, current and complete information with regards to yourself as may be requested by the data registration process, and</p>
                <p>&nbsp;</p>
                <p>b)&nbsp;&nbsp;&nbsp;&nbsp;maintain and promptly update your registration and profile information in an effort to maintain accuracy and completeness at all times.</p>
                <p>&nbsp;</p>
                <p>If anyone knowingly provides any information of a false, untrue, inaccurate or incomplete nature, Arrivy will have sufficient grounds and rights to suspend or terminate the member in violation of this aspect of the Agreement, and as such refuse any and all current or future use of Arrivy Services, or any portion thereof.</p>
                <p>&nbsp;</p>
                <p>It is Arrivy's priority to ensure the safety and privacy of all its visitors, users and members, especially that of children. Therefore, it is for this reason that the parents of any child under the age of 13 that permit their child or children access to the Arrivy website platform Services must create a "family" account, which will certify that the individual creating the "family" account is of 18 years of age and as such, the parent or legal guardian of any child or children registered under the "family" account. As the creator of the "family" account, s/he is thereby granting permission for his/her child or children to access the various Services provided, including, but not limited to, message boards, email, and/or instant messaging. It is the parent's and/or legal guardian's responsibility to determine whether any of the Services and/or content provided are age-appropriate for his/her child.</p>
                <p>&nbsp;</p>
                <p><strong>MEMBER ACCOUNT, USERNAME, PASSWORD, AND SECURITY</strong></p>
                <p>&nbsp;</p>
                <p>When you set up an account, you are the sole authorized user of your account. You shall be responsible for maintaining the secrecy and confidentiality of your password and for all activities that transpire on or within your account. It is your responsibility for any act or omission of any user(s) that access your account information that, if undertaken by you, would be deemed a violation of the TOS. It shall be your responsibility to notify Arrivy immediately if you notice any unauthorized access or use of your account or password or any other breach of security. Arrivy shall not be held liable for any loss and/or damage arising from any failure to comply with this term and/or condition of the TOS.</p>
                <p>&nbsp;</p>
                <p><strong>CONDUCT</strong></p>
                <p>&nbsp;</p>
                <p>As a user or member of the Site, you herein acknowledge, understand and agree that all information, text, software, data, photographs, music, video, messages, tags or any other content, whether it is publicly or privately posted and/or transmitted, is the expressed sole responsibility of the individual from whom the content originated. In short, this means that you are solely responsible for any and all content posted, uploaded, emailed, transmitted or otherwise made available by way of the Arrivy Services, and as such, we do not guarantee the accuracy, integrity or quality of such content. It is expressly understood that by use of our Services, you may be exposed to content including, but not limited to, any errors or omissions in any content posted, and/or any loss or damage of any kind incurred as a result of the use of any content posted, emailed, transmitted or otherwise made available by Arrivy.</p>
                <p>&nbsp;</p>
                <p>Furthermore, you herein agree not to make use of Arrivy's Services for the purpose of:</p>
                <p>&nbsp;</p>
                <p>a)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;uploading, posting, emailing, transmitting, or otherwise making available any content that shall be deemed unlawful, harmful, threatening, abusive, harassing, tortious, defamatory, vulgar, obscene, libelous, or invasive of another's privacy or which is hateful, and/or racially, ethnically, or otherwise objectionable;</p>
                <p>&nbsp;</p>
                <p>b)&nbsp;&nbsp;&nbsp;&nbsp;causing harm to minors in any manner whatsoever;</p>
                <p>&nbsp;</p>
                <p>c)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;impersonating any individual or entity, including, but not limited to, any Arrivy officials, forum leaders, guides or hosts or falsely stating or otherwise misrepresenting any affiliation with an individual or entity;</p>
                <p>&nbsp;</p>
                <p>d)&nbsp;&nbsp;&nbsp;&nbsp;forging captions, headings or titles or otherwise offering any content that you personally have no right to pursuant to any law nor having any contractual or fiduciary relationship with;</p>
                <p>&nbsp;</p>
                <p>e)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;uploading, posting, emailing, transmitting or otherwise offering any such content that may infringe upon any patent, copyright, trademark, or any other proprietary or intellectual rights of any other party;</p>
                <p>&nbsp;</p>
                <p>f)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;uploading, posting, emailing, transmitting or otherwise offering any content that you do not personally have any right to offer pursuant to any law or in accordance with any contractual or fiduciary relationship;</p>
                <p>&nbsp;</p>
                <p>g)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;uploading, posting, emailing, transmitting, or otherwise offering any unsolicited or unauthorized advertising, promotional flyers, "junk mail," "spam," or any other form of solicitation, except in any such areas that may have been designated for such purpose;</p>
                <p>&nbsp;</p>
                <p>h)&nbsp;&nbsp;&nbsp;&nbsp;uploading, posting, emailing, transmitting, or otherwise offering any source that may contain a software virus or other computer code, any files and/or programs which have been designed to interfere, destroy and/or limit the operation of any computer software, hardware, or telecommunication equipment;</p>
                <p>&nbsp;</p>
                <p>i)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;disrupting the normal flow of communication, or otherwise acting in any manner that would negatively affect other users' ability to participate in any real-time interactions;</p>
                <p>&nbsp;</p>
                <p>j)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;interfering with or disrupting any Arrivy Services, servers and/or networks that may be connected or related to our website, including, but not limited to, the use of any device software and/or routine to bypass the robot exclusion headers;</p>
                <p>&nbsp;</p>
                <p>k)&nbsp;&nbsp;&nbsp;&nbsp;intentionally or unintentionally violating any local, state, federal, national or international law, including, but not limited to, rules, guidelines, and/or regulations decreed by the U.S. Securities and Exchange Commission, in addition to any rules of any nation or other securities exchange, that would include without limitation, the New York Stock Exchange, the American Stock Exchange, or the NASDAQ, and any regulations having the force of law;</p>
                <p>&nbsp;</p>
                <p>l)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;providing informational support or resources, concealing and/or disguising the character, location, and or source to any organization delegated by the United States government as a "foreign terrorist organization" in accordance to Section 219 of the Immigration Nationality Act;</p>
                <p>&nbsp;</p>
                <p>m)&nbsp;&nbsp;&nbsp;"stalking" or with the intent to otherwise harass another individual; and/or</p>
                <p>&nbsp;</p>
                <p>n)&nbsp;&nbsp;&nbsp;&nbsp;collecting or storing of any personal data relating to any other member or user in connection with the prohibited conduct and/or activities which have been set forth in the aforementioned paragraphs.</p>
                <p>&nbsp;</p>
                <p>Arrivy herein reserves the right to pre-screen, refuse and/or delete any content currently available through our Services. In addition, we reserve the right to remove and/or delete any such content that would violate the TOS&nbsp;or which would otherwise be considered offensive to other visitors, users and/or members.</p>
                <p>&nbsp;</p>
                <p>Arrivy herein reserves the right to access, preserve and/or disclose member account information and/or content if it is requested to do so by law or in good faith belief that any such action is deemed reasonably necessary for:</p>
                <p>&nbsp;</p>
                <p>a)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;compliance with any legal process;</p>
                <p>&nbsp;</p>
                <p>b)&nbsp;&nbsp;&nbsp;&nbsp;enforcement of the TOS;</p>
                <p>&nbsp;</p>
                <p>c)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;responding to any claim that therein contained content is in violation of the rights of any third party;</p>
                <p>&nbsp;</p>
                <p>d)&nbsp;&nbsp;&nbsp;&nbsp;responding to requests for customer service; or</p>
                <p>&nbsp;</p>
                <p>e)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;protecting the rights, property or the personal safety of Arrivy, its visitors, users and members, including the general public.</p>
                <p>&nbsp;</p>
                <p>Arrivy herein reserves the right to include the use of security components that may permit digital information or material to be protected, and that such use of information and/or material is subject to usage guidelines and regulations established by Arrivy or any other content providers supplying content services to Arrivy. You are hereby prohibited from making any attempt to override or circumvent any of the embedded usage rules in our Services. Furthermore, unauthorized reproduction, publication, distribution, or exhibition of any information or materials supplied by our Services, despite whether done so in whole or in part, is expressly prohibited.</p>
                <p>&nbsp;</p>
                <p><strong>CAUTIONS FOR GLOBAL USE AND EXPORT AND IMPORT COMPLIANCE</strong></p>
                <p>&nbsp;</p>
                <p>Due to the global nature of the internet, through the use of our network, you hereby agree to comply with all local rules relating to online conduct and that which is considered acceptable Content. Uploading, posting and/or transferring of software, technology, and other technical data may be subject to the export and import laws of the United States and possibly other countries. Through the use of our network, you thus agree to comply with all applicable export and import laws, statutes and regulations, including, but not limited to, the Export Administration Regulations (<a href="http://www.access.gpo.gov/bis/ear/ear_data.html">http://www.access.gpo.gov/bis/ear/ear_data.html</a>), as well as the sanctions control program of the United States (<a href="http://www.treasury.gov/resource-center/sanctions/Programs/Pages/Programs.aspx">http://www.treasury.gov/resource-center/sanctions/Programs/Pages/Programs.aspx</a>). Furthermore, you state and pledge that you:</p>
                <p>&nbsp;</p>
                <p>a)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;are not on the list of prohibited individuals which may be identified on any government export exclusion report (<a href="http://www.bis.doc.gov/complianceandenforcement/liststocheck.htm">http://www.bis.doc.gov/complianceandenforcement/liststocheck.htm</a>) nor a member of any other government which may be part of an export-prohibited country identified in applicable export and import laws and regulations;</p>
                <p>&nbsp;</p>
                <p>b)&nbsp;&nbsp;&nbsp;&nbsp;agree not to transfer any software, technology or any other technical data through the use of our network Services to any export-prohibited country;</p>
                <p>&nbsp;</p>
                <p>c)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;agree not to use our website network Services for any military, nuclear, missile, chemical or biological weaponry end uses that would be a violation of the U.S. export laws; and</p>
                <p>&nbsp;</p>
                <p>d)&nbsp;&nbsp;&nbsp;&nbsp;agree not to post, transfer nor upload any software, technology or any other technical data which would be in violation of the U.S. or other applicable export and/or import laws.</p>
                <p>&nbsp;</p>
                <p><strong>CONTENT PLACED OR MADE AVAILABLE FOR COMPANY SERVICES</strong></p>
                <p>&nbsp;</p>
                <p>Arrivy shall not lay claim to ownership of any content submitted by any visitor, member,&nbsp;or user, nor make such content available for inclusion on our website Services. Therefore, you hereby grant and allow for Arrivy the below listed worldwide, royalty-free and non-exclusive licenses, as applicable:</p>
                <p>&nbsp;</p>
                <p>a)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;The content submitted or made available for inclusion on the publicly accessible areas of Arrivy's sites, the license provided to permit to use, distribute, reproduce, modify, adapt, publicly perform and/or publicly display said Content on our network Services is for the sole purpose of providing and promoting the specific area to which this content was placed and/or made available for viewing. This license shall be available so long as you are a member of Arrivy's sites, and shall terminate at such time when you elect to discontinue your membership.</p>
                <p>&nbsp;</p>
                <p>b)&nbsp;&nbsp;&nbsp;&nbsp;Photos, audio, video and/or graphics submitted or made available for inclusion on the publicly accessible areas of Arrivy's sites, the license provided to permit to use, distribute, reproduce, modify, adapt, publicly perform and/or publicly display said Content on our network Services are for the sole purpose of providing and promoting the specific area in which this content was placed and/or made available for viewing. This license shall be available so long as you are a member of Arrivy's sites and shall terminate at such time when you elect to discontinue your membership.</p>
                <p>&nbsp;</p>
                <p>c)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;For any other content submitted or made available for inclusion on the publicly accessible areas of Arrivy's sites, the continuous, binding and completely sub-licensable license which is meant to permit to use, distribute, reproduce, modify, adapt, publish, translate, publicly perform and/or publicly display said content, whether in whole or in part, and the incorporation of any such Content into other works in any arrangement or medium current used or later developed.</p>
                <p>&nbsp;</p>
                <p>Those areas which may be deemed "publicly accessible" areas of Arrivy's sites are those such areas of our network properties which are meant to be available to the general public, and which would include message boards and groups that are openly available to&nbsp;both&nbsp;users&nbsp;and members.</p>
                <p>&nbsp;</p>
                <p>&nbsp;</p>
                <p><strong>CONTRIBUTIONS TO COMPANY WEBSITE</strong></p>
                <p>&nbsp;</p>
                <p>Arrivy provides an area for our users&nbsp;and members&nbsp;to contribute feedback to our website. When you submit ideas, documents, suggestions and/or proposals ("Contributions") to our site, you acknowledge and agree that:</p>
                <p>&nbsp;</p>
                <p>a)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;your contributions do not contain any type of confidential or proprietary information;</p>
                <p>&nbsp;</p>
                <p>b)&nbsp;&nbsp;&nbsp;&nbsp;Arrivy shall not be liable or under any obligation to ensure or maintain confidentiality, expressed or implied, related to any Contributions;</p>
                <p>&nbsp;</p>
                <p>c)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Arrivy shall be entitled to make use of and/or disclose any such Contributions in any such manner as they may see fit;</p>
                <p>&nbsp;</p>
                <p>d)&nbsp;&nbsp;&nbsp;&nbsp;the contributor's Contributions shall automatically become the sole property of Arrivy; and</p>
                <p>&nbsp;</p>
                <p>e)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Arrivy is under no obligation to either compensate or provide any form of reimbursement in any manner or nature.</p>
                <p>&nbsp;</p>
                <p><strong>INDEMNITY</strong></p>
                <p>&nbsp;</p>
                <p>All users&nbsp;and/or members&nbsp;herein agree to ensure and hold Arrivy, our subsidiaries, affiliates, agents, employees, officers, partners and/or licensors blameless or&nbsp;not liable&nbsp;for any claim or demand, which may include, but is not limited to, reasonable attorney fees made by any third party which may arise from any content a&nbsp;member or&nbsp;user of our site may submit, post, modify, transmit or otherwise make available through our Services, the use of&nbsp;&nbsp;Arrivy Services or your connection with these Services, your violations of the Terms of Service and/or your violation of any such rights of another person.</p>
                <p>&nbsp;</p>
                <p><strong>COMMERCIAL REUSE OF SERVICES</strong></p>
                <p>&nbsp;</p>
                <p>The&nbsp;member or&nbsp;user herein agrees not to replicate, duplicate, copy, trade, sell, resell nor exploit for any commercial reason any part, use of, or access to Arrivy's sites.</p>
                <p>&nbsp;</p>
                <p><strong>USE AND STORAGE GENERAL PRACTICES</strong></p>
                <p>&nbsp;</p>
                <p>You herein acknowledge that Arrivy may set up any such practices and/or limits regarding the use of our Services, without limitation of the maximum number of days that any email, message posting or any other uploaded content shall be retained by Arrivy, nor the maximum number of email messages that may be sent and/or received by any member, the maximum volume or size of any email message that may be sent from or may be received by an account on our Service, the maximum disk space allowable that shall be allocated on Arrivy's servers on the member's behalf, and/or the maximum number of times and/or duration that any member may access our Services in a given period of time.&nbsp;&nbsp;In addition, you also agree that Arrivy has absolutely no responsibility or liability for the removal or failure to maintain storage of any messages and/or other communications or content maintained or transmitted by our Services. You also herein acknowledge that we reserve the right to delete or remove any account that is no longer active for an extended period of time. Furthermore, Arrivy shall reserve the right to modify, alter and/or update these general practices and limits at our discretion.</p>
                <p>&nbsp;</p>
                <p><strong>MODIFICATIONS</strong></p>
                <p>&nbsp;</p>
                <p>Arrivy shall reserve the right at any time it may deem fit, to modify, alter and or discontinue, whether temporarily or permanently, our service, or any part thereof, with or without prior notice. In addition, we shall not be held liable to you or to any third party for any such alteration, modification, suspension and/or discontinuance of our Services, or any part thereof.</p>
                <p>&nbsp;</p>
                <p><strong>TERMINATION</strong></p>
                <p>&nbsp;</p>
                <p>As a member of www.arrivy.com, you may cancel or terminate your account, associated email address and/or access to our Services by submitting a cancellation or termination request to support@arrivy.com.</p>
                <p>&nbsp;</p>
                <p>As a member, you agree that Arrivy may, without any prior written notice, immediately suspend, terminate, discontinue and/or limit your account, any email associated with your account, and access to any of our Services. The cause for such termination, discontinuance, suspension and/or limitation of access shall include, but is not limited to:</p>
                <p>&nbsp;</p>
                <p>a)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;any breach or violation of our TOS or any other incorporated agreement, regulation and/or guideline;</p>
                <p>&nbsp;</p>
                <p>b)&nbsp;&nbsp;&nbsp;&nbsp;by way of requests from law enforcement or any other governmental agencies;</p>
                <p>&nbsp;</p>
                <p>c)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;the discontinuance, alteration and/or material modification to our Services, or any part thereof;</p>
                <p>&nbsp;</p>
                <p>d)&nbsp;&nbsp;&nbsp;&nbsp;unexpected technical or security issues and/or problems;</p>
                <p>&nbsp;</p>
                <p>e)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;any extended periods of inactivity;</p>
                <p>&nbsp;</p>
                <p>f)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;any engagement by you in any fraudulent or illegal activities; and/or</p>
                <p>&nbsp;</p>
                <p>g)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;the nonpayment of any associated fees that may be owed by you in connection with your www.arrivy.com account Services.</p>
                <p>&nbsp;</p>
                <p>Furthermore, you herein agree that any and all terminations, suspensions, discontinuances, and or limitations of access for cause shall be made at our sole discretion and that we shall not be liable to you or any other third party with regards to the termination of your account, associated email address and/or access to any of our Services.</p>
                <p>&nbsp;</p>
                <p>The termination of your account with www.arrivy.com shall include any and/or all of the following:</p>
                <p>&nbsp;</p>
                <p>a)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;the removal of any access to all or part of the Services offered within www.arrivy.com;</p>
                <p>&nbsp;</p>
                <p>b)&nbsp;&nbsp;&nbsp;&nbsp;the deletion of your password and any and all related information, files, and any such content that may be associated with or inside your account, or any part thereof; and</p>
                <p>&nbsp;</p>
                <p>c)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;the barring of any further use of all or part of our Services.</p>
                <p>&nbsp;</p>
                <p><strong>ADVERTISERS</strong></p>
                <p>&nbsp;</p>
                <p>Any correspondence or business dealings with, or the participation in any promotions of, advertisers located on or through our Services, which may include the payment and/or delivery of such related goods and/or Services, and any such other term, condition, warranty and/or representation associated with such dealings, are and shall be solely between you and any such advertiser. Moreover, you herein agree that Arrivy shall not be held responsible or liable for any loss or damage of any nature or manner incurred as a direct result of any such dealings or as a result of the presence of such advertisers on our website.</p>
                <p>&nbsp;</p>
                <p><strong>LINKS</strong></p>
                <p>&nbsp;</p>
                <p>Either Arrivy or any third parties may provide links to other websites and/or resources. Thus, you acknowledge and agree that we are not responsible for the availability of any such external sites or resources, and as such, we do not endorse nor are we responsible or liable for any content, products, advertising or any other materials, on or available from such third party sites or resources. Furthermore, you acknowledge and agree that Arrivy shall not be responsible or liable, directly or indirectly, for any such damage or loss which may be a result of, caused or allegedly to be caused by or in connection with the use of or the reliance on any such content, goods or Services made available on or through any such site or resource.</p>
                <p>&nbsp;</p>
                <p><strong>PROPRIETARY RIGHTS</strong></p>
                <p>&nbsp;</p>
                <p>You do hereby acknowledge and agree that Arrivy's Services and any essential software that may be used in connection with our Services ("Software") shall contain proprietary and confidential material that is protected by applicable intellectual property rights and other laws. Furthermore, you herein acknowledge and agree that any Content which may be contained in any advertisements or information presented by and through our Services or by advertisers is protected by copyrights, trademarks, patents or other proprietary rights and laws. Therefore, except for that which is expressly permitted by applicable law or as authorized by Arrivy or such applicable licensor, you agree not to alter, modify, lease, rent, loan, sell, distribute, transmit, broadcast, publicly perform and/or created any plagiaristic works which are based on Arrivy Services (e.g. Content or Software), in whole or part.</p>
                <p>&nbsp;</p>
                <p>Arrivy herein has granted you personal, non-transferable and non-exclusive rights and/or license to make use of the object code or our Software on a single computer, as long as you do not, and shall not, allow any third party to duplicate, alter, modify, create or plagiarize work from, reverse engineer, reverse assemble or otherwise make an attempt to locate or discern any source code, sell, assign, sublicense, grant a security interest in and/or otherwise transfer any such right in the Software. Furthermore, you do herein agree not to alter or change the Software in any manner, nature or form, and as such, not to use any modified versions of the Software, including and without limitation, for the purpose of obtaining unauthorized access to our Services. Lastly, you also agree not to access or attempt to access our Services through any means other than through the interface which is provided by Arrivy for use in accessing our Services.</p>
                <p>&nbsp;</p>
                <p><strong>WARRANTY DISCLAIMERS</strong></p>
                <p>&nbsp;</p>
                <p>YOU HEREIN EXPRESSLY ACKNOWLEDGE AND AGREE THAT:</p>
                <p>&nbsp;</p>
                <p>a)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;THE USE OF Arrivy SERVICES AND SOFTWARE ARE AT THE SOLE RISK BY YOU. OUR SERVICES AND SOFTWARE SHALL BE PROVIDED ON AN "AS IS" AND/OR "AS AVAILABLE" BASIS. Arrivy AND OUR SUBSIDIARIES, AFFILIATES, OFFICERS, EMPLOYEES, AGENTS, PARTNERS AND LICENSORS EXPRESSLY DISCLAIM ANY AND ALL WARRANTIES OF ANY KIND WHETHER EXPRESSED OR IMPLIED, INCLUDING, BUT NOT LIMITED TO ANY IMPLIED WARRANTIES OF TITLE, MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT.</p>
                <p>&nbsp;</p>
                <p>b)&nbsp;&nbsp;&nbsp;&nbsp;Arrivy AND OUR SUBSIDIARIES, OFFICERS, EMPLOYEES, AGENTS, PARTNERS AND LICENSORS MAKE NO SUCH WARRANTIES THAT (i) Arrivy SERVICES OR SOFTWARE WILL MEET YOUR REQUIREMENTS; (ii) Arrivy SERVICES OR SOFTWARE SHALL BE UNINTERRUPTED, TIMELY, SECURE OR ERROR-FREE; (iii) THAT SUCH RESULTS WHICH MAY BE OBTAINED FROM THE USE OF THE Arrivy SERVICES OR SOFTWARE WILL BE ACCURATE OR RELIABLE; (iv) QUALITY OF ANY PRODUCTS, SERVICES, ANY INFORMATION OR OTHER MATERIAL WHICH MAY BE PURCHASED OR OBTAINED BY YOU THROUGH OUR SERVICES OR SOFTWARE WILL MEET YOUR EXPECTATIONS; AND (v) THAT ANY SUCH ERRORS CONTAINED IN THE SOFTWARE SHALL BE CORRECTED.</p>
                <p>&nbsp;</p>
                <p>c)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ANY INFORMATION OR MATERIAL DOWNLOADED OR OTHERWISE OBTAINED BY WAY OF Arrivy SERVICES OR SOFTWARE SHALL BE ACCESSED BY YOUR SOLE DISCRETION AND SOLE RISK, AND AS SUCH YOU SHALL BE SOLELY RESPONSIBLE FOR AND HEREBY WAIVE ANY AND ALL CLAIMS AND CAUSES OF ACTION WITH RESPECT TO ANY DAMAGE TO YOUR COMPUTER AND/OR INTERNET ACCESS, DOWNLOADING AND/OR DISPLAYING, OR FOR ANY LOSS OF DATA THAT COULD RESULT FROM THE DOWNLOAD OF ANY SUCH INFORMATION OR MATERIAL.</p>
                <p>&nbsp;</p>
                <p>d)&nbsp;&nbsp;&nbsp;&nbsp;NO ADVICE AND/OR INFORMATION, DESPITE WHETHER WRITTEN OR ORAL, THAT MAY BE OBTAINED BY YOU FROM Arrivy OR BY WAY OF OR FROM OUR SERVICES OR SOFTWARE SHALL CREATE ANY WARRANTY NOT EXPRESSLY STATED IN THE TOS.</p>
                <p>&nbsp;</p>
                <p>e)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;A SMALL PERCENTAGE OF SOME USERS MAY EXPERIENCE SOME DEGREE OF EPILEPTIC SEIZURE WHEN EXPOSED TO CERTAIN LIGHT PATTERNS OR BACKGROUNDS THAT MAY BE CONTAINED ON A COMPUTER SCREEN OR WHILE USING OUR SERVICES. CERTAIN CONDITIONS MAY INDUCE A PREVIOUSLY UNKNOWN CONDITION OR UNDETECTED EPILEPTIC SYMPTOM IN USERS WHO HAVE SHOWN NO HISTORY OF ANY PRIOR SEIZURE OR EPILEPSY. SHOULD YOU, ANYONE YOU KNOW OR ANYONE IN YOUR FAMILY HAVE AN EPILEPTIC CONDITION, PLEASE CONSULT A PHYSICIAN IF YOU EXPERIENCE ANY OF THE FOLLOWING SYMPTOMS WHILE USING OUR SERVICES: DIZZINESS, ALTERED VISION, EYE OR MUSCLE TWITCHES, LOSS OF AWARENESS, DISORIENTATION, ANY INVOLUNTARY MOVEMENT, OR CONVULSIONS.</p>
                <p>&nbsp;</p>
                <p><strong>LIMITATION OF LIABILITY</strong></p>
                <p>&nbsp;</p>
                <p>YOU EXPLICITLY ACKNOWLEDGE, UNDERSTAND AND AGREE THAT Arrivy AND OUR SUBSIDIARIES, AFFILIATES, OFFICERS, EMPLOYEES, AGENTS, PARTNERS AND LICENSORS SHALL NOT BE LIABLE TO YOU FOR ANY PUNITIVE, INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL OR EXEMPLARY DAMAGES, INCLUDING, BUT NOT LIMITED TO, DAMAGES WHICH MAY BE RELATED TO THE LOSS OF ANY PROFITS, GOODWILL, USE, DATA AND/OR OTHER INTANGIBLE LOSSES, EVEN THOUGH WE MAY HAVE BEEN ADVISED OF SUCH POSSIBILITY THAT SAID DAMAGES MAY OCCUR, AND RESULT FROM:</p>
                <p>&nbsp;</p>
                <p>a)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;THE USE OR INABILITY TO USE OUR SERVICE;</p>
                <p>&nbsp;</p>
                <p>b)&nbsp;&nbsp;&nbsp;&nbsp;THE COST OF PROCURING SUBSTITUTE GOODS AND SERVICES;</p>
                <p>&nbsp;</p>
                <p>c)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;UNAUTHORIZED ACCESS TO OR THE ALTERATION OF YOUR TRANSMISSIONS AND/OR DATA;</p>
                <p>&nbsp;</p>
                <p>d)&nbsp;&nbsp;&nbsp;&nbsp;STATEMENTS OR CONDUCT OF ANY SUCH THIRD PARTY ON OUR SERVICE;</p>
                <p>&nbsp;</p>
                <p>e)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;AND ANY OTHER MATTER WHICH MAY BE RELATED TO OUR SERVICE.</p>
                <p>&nbsp;</p>
                <p><strong>RELEASE</strong></p>
                <p>&nbsp;</p>
                <p>In the event you have a dispute, you agree to release Arrivy (and its officers, directors, employees, agents, parent subsidiaries, affiliates, co-branders, partners and any other third parties) from claims, demands and damages (actual and consequential) of every kind and nature, known and unknown, suspected or unsuspected, disclosed and undisclosed, arising out of or in any way connected to such dispute.</p>
                <p>&nbsp;</p>
                <p><strong>SPECIAL ADMONITION RELATED TO FINANCIAL MATTERS</strong></p>
                <p>&nbsp;</p>
                <p>Should you intend to create or to join any service, receive or request any such news, messages, alerts or other information from our Services concerning companies, stock quotes, investments or securities, please review the above Sections Warranty Disclaimers and Limitations of Liability again. In addition, for this particular type of information, the phrase "Let the investor beware" is appropriate. Arrivy's content is provided primarily for informational purposes, and no content that shall be provided or included in our Services is intended for trading or investing purposes. Arrivy and our licensors shall not be responsible or liable for the accuracy, usefulness or availability of any information transmitted and/or made available by way of our Services, and shall not be responsible or liable for any trading and/or investment decisions based on any such information.</p>
                <p>&nbsp;</p>
                <p><strong>EXCLUSION AND LIMITATIONS</strong></p>
                <p>&nbsp;</p>
                <p>THERE ARE SOME JURISDICTIONS WHICH DO NOT ALLOW THE EXCLUSION OF CERTAIN WARRANTIES OR THE LIMITATION OF EXCLUSION OF LIABILITY FOR INCIDENTAL OR CONSEQUENTIAL DAMAGES. THEREFORE, SOME OF THE ABOVE LIMITATIONS OF SECTIONS WARRANTY DISCLAIMERS AND LIMITATION OF LIABILITY MAY NOT APPLY TO YOU.</p>
                <p>&nbsp;</p>
                <p><strong>THIRD PARTY BENEFICIARIES</strong></p>
                <p>&nbsp;</p>
                <p>You herein acknowledge, understand and agree, unless otherwise expressly provided in this TOS, that there shall be no third-party beneficiaries to this agreement.</p>
                <p>&nbsp;</p>
                <p><strong>NOTICE</strong></p>
                <p>&nbsp;</p>
                <p>Arrivy may furnish you with notices, including those with regards to any changes to the TOS, including but not limited to email, regular mail, MMS or SMS, text messaging, postings on our website Services, or other reasonable means currently known or any which may be hereinafter developed. Any such notices may not be received if you violate any aspects of the TOS by accessing our Services in an unauthorized manner. Your acceptance of this TOS constitutes your agreement that you are deemed to have received any and all notices that would have been delivered had you accessed our Services in an authorized manner.</p>
                <p>&nbsp;</p>
                <p><strong>TRADEMARK INFORMATION</strong></p>
                <p>&nbsp;</p>
                <p>You herein acknowledge, understand and agree that all of the Arrivy trademarks, copyright, trade name, service marks, and other Arrivy logos and any brand features, and/or product and service names are trademarks and as such, are and shall remain the property of Arrivy. You herein agree not to display and/or use in any manner the Arrivy logo or marks without obtaining Arrivy's prior written consent.</p>
                <p>&nbsp;</p>
                <p><strong>COPYRIGHT OR INTELLECTUAL PROPERTY INFRINGEMENT CLAIMS NOTICE</strong></p>
                <p><strong>&amp; PROCEDURES</strong></p>
                <p>&nbsp;</p>
                <p>Arrivy will always respect the intellectual property of others, and we ask that all of our users do the same. With regards to appropriate circumstances and at its sole discretion, Arrivy may disable and/or terminate the accounts of any user who violates our TOS and/or infringes the rights of others. If you feel that your work has been duplicated in such a way that would constitute copyright infringement, or if you believe your intellectual property rights have been otherwise violated, you should provide to us the following information:</p>
                <p>&nbsp;</p>
                <p>a)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;The electronic or the physical signature of the individual that is authorized on behalf of the owner of the copyright or other intellectual property interest;</p>
                <p>&nbsp;</p>
                <p>b)&nbsp;&nbsp;&nbsp;&nbsp;A description of the copyrighted work or other intellectual property that you believe has been infringed upon;</p>
                <p>&nbsp;</p>
                <p>c)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;A description of the location of the site which you allege has been infringing upon your work;</p>
                <p>&nbsp;</p>
                <p>d)&nbsp;&nbsp;&nbsp;&nbsp;Your physical address, telephone number, and email address;</p>
                <p>&nbsp;</p>
                <p>e)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;A statement, in which you state that the alleged and disputed use of your work is not authorized by the copyright owner, its agents or the law;</p>
                <p>&nbsp;</p>
                <p>f)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;And finally, a statement, made under penalty of perjury, that the aforementioned information in your notice is truthful and accurate, and that you are the copyright or intellectual property owner, representative or agent authorized to act on the copyright or intellectual property owner's behalf.</p>
                <p>&nbsp;</p>
                <p>The Arrivy Agent for notice of claims of copyright or other intellectual property infringement can be contacted as follows:</p>
                <p>&nbsp;</p>
                <p>Mailing Address:</p>
                <p>Arrivy</p>
                <p>Attn: Copyright Agent</p>
                <p>10400 NE 4th St</p>
                <p>Fl #5</p>
                <p>Bellevue, Washington 98004</p>
                <p>&nbsp;</p>
                <p>Telephone: +1 (855) 927-7489</p>
                <p>Email:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;info@arrivy.com</p>
                <p>&nbsp;</p>
                <p><strong>CLOSED CAPTIONING</strong></p>
                <p>&nbsp;</p>
                <p>BE IT KNOWN, that Arrivy complies with all applicable Federal Communications Commission rules and regulations regarding the closed captioning of video content. For more information, please visit our website at www.arrivy.com.</p>
                <p>&nbsp;</p>
                <p><strong>GENERAL INFORMATION</strong></p>
                <p>&nbsp;</p>
                <p><strong><em>ENTIRE AGREEMENT</em></strong></p>
                <p>This TOS constitutes the entire agreement between you and Arrivy and shall govern the use of our Services, superseding any prior version of this TOS between you and us with respect to Arrivy Services. You may also be subject to additional terms and conditions that may apply when you use or purchase certain other Arrivy Services, affiliate Services, third-party content or third-party software.</p>
                <p>&nbsp;</p>
                <p><strong><em>CHOICE OF LAW AND FORUM</em></strong></p>
                <p>It is at the mutual agreement of both you and Arrivy with regard to the TOS that the relationship between the parties shall be governed by the laws of the state of Washington without regard to its conflict of law provisions and that any and&nbsp;all claims, causes of action and/or disputes, arising out of or relating to the TOS, or the relationship between you and Arrivy, shall be filed within the courts having jurisdiction within the County of King, Washington or the U.S. District Court located in said state. You and Arrivy agree to submit to the jurisdiction of the courts as previously mentioned, and agree to waive any and all objections to the exercise of jurisdiction over the parties by such courts and to venue in such courts.</p>
                <p>&nbsp;</p>
                <p><strong><em>WAIVER AND SEVERABILITY OF TERMS</em></strong></p>
                <p>At any time, should Arrivy fail to exercise or enforce any right or provision of the TOS, such failure shall not constitute a waiver of such right or provision. If any provision of this TOS is found by a court of competent jurisdiction to be invalid, the parties nevertheless agree that the court should endeavor to give effect to the parties' intentions as reflected in the provision, and the other provisions of the TOS remain in full force and effect.</p>
                <p>&nbsp;</p>
                <p><strong><em>NO RIGHT OF SURVIVORSHIP NON-TRANSFERABILITY</em></strong></p>
                <p>You acknowledge, understand and agree that your account is non-transferable and any rights to your ID and/or contents within your account shall terminate upon your death. Upon receipt of a copy of a death certificate, your account may be terminated and all contents therein permanently deleted.</p>
                <p>&nbsp;</p>
                <p><strong><em>STATUTE OF LIMITATIONS</em></strong></p>
                <p>You acknowledge, understand and agree that regardless of any statute or law to the contrary, any claim or action arising out of or related to the use of our Services or the TOS must be filed within&nbsp;1&nbsp;year(s) after said claim or cause of action arose or shall be forever barred.</p>
                <p>&nbsp;</p>
                <p><strong>VIOLATIONS</strong></p>
                <p>&nbsp;</p>
                <p>Please report any and all violations of this TOS to Arrivy as follows:</p>
                <p>&nbsp;</p>
                <p>Mailing Address:</p>
                <p>Arrivy, Inc.</p>
                <p>10400 NE 4th St</p>
                <p>Fl #5</p>
                <p>Bellevue, Washington 98004</p>
                <p>&nbsp;</p>
                <p>Telephone: +1 (855) 927-7489</p>
                <p>&nbsp;&nbsp;&nbsp;&nbsp;</p>
                <p>Email:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;info@arrivy.com</p>
                <p>&nbsp;</p>
              </div>
            </Col>
          </Row>
        </Grid>
        </div>
        <Footer3v data={landingPageData} />
      </div>
    );
  }
}

Terms.contextTypes = {
  router: PropTypes.object.isRequired
};