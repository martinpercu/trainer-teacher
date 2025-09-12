export interface Recruiter {
  recruiterUID: string;
  email: string,
  username: string;
  displayname?: string;
  lastname?: string;
  id?: string;
  subscriptionLevel: number;
  cellphone?: string;
  whatsapp?: string;
  businessName?: string;
  allowSMS?: boolean;
  allowWhatsapp?: boolean;
}
