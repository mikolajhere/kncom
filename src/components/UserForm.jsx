import { FormWrapper } from "./FormWrapper";

export function UserForm({
  dataPhone,
  dataLog,
  updateFields,
  dataEmail,
}) {
  return (
    <FormWrapper title="Dane kontaktowe">
      <>
        <label className="legal-label" htmlFor="phone">
          {" "}
          Telefon
        </label>
        <input
          className="legal-input"
          type="tel"
          name="dataPhone"
          placeholder="512 456 789"
          id="phone"
          required
          minLength={9}
          maxLength={14}
          value={dataPhone}
          onChange={(e) => updateFields({ dataPhone: e.target.value })}
        />
      </>
      <>
        <label className="legal-label" htmlFor="email">
          {" "}
          E-mail (opcjonalnie)
        </label>
        <input
          id="email"
          className="legal-input"
          type="text"
          name="dataEmail"
          placeholder="jan@przykladowy.pl"
          value={dataEmail}
          onChange={(e) => updateFields({ dataEmail: e.target.value })}
        />
      </>
      <>
        <label className="legal-label" htmlFor="log">
          {" "}
          Opisz jakiej pomocy prawnej potrzebujesz? (opcjonalnie)
        </label>
        <textarea
          className="legal-textarea" 
          id="log"
          name="dataLog"
          placeholder=""
          value={dataLog}
          onChange={(e) =>
            updateFields({ dataLog: e.target.value })
          }
        />
      </>
    </FormWrapper>
  );
}
