import React from "react";

export interface WowProps {}

const Wow = ({}: WowProps) => {
  const migrate = async () => {
    const res = await fetch(
      "/api/observations/bysite?start_time=2020-01-10T00:00:00Z&end_time=2020-01-10T23:59:59Z&site_id=afe6baff-b92c-ea11-8454-0003ff599bc1",
      {
        headers: {
          "Ocp-Apim-Subscription-Key": "072641561f4d46d58f65f36975a880fb",
        },
      }
    ).then((x) => {
      if (!x.ok) {
        throw x;
      }

      return x.json();
    });

    console.log(res);
  };
  return (
    <>
      <h2>Import from WOW</h2>
      <button onClick={() => migrate()}>Import</button>
    </>
  );
};

export default Wow;
