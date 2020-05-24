import React, { useEffect, useState } from "react";
import {
  initializeBlock,
  useBase,
  useRecords,
  RecordCardList,
  Button,
  Box,
  Dialog,
  Heading,
  Text,
  Loader,
} from "@airtable/blocks/ui";
import { processImage } from "../api/rekognition";

function ObjectDetectionBlock() {
  // YOUR CODE GOES HERE
  const [selectedRecord, setSelectedRecord] = useState(null);
  const base = useBase();
  const table = base.getTableByName("Images");
  const records = useRecords(table);

  return (
    <Box height="500px" border="thick" backgroundColor="lightGray1">
      <RecordCardList
        onRecordClick={(record) => setSelectedRecord(record)}
        records={records}
      />
      {selectedRecord && (
        <RekognitionResultsDialog
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
        />
      )}
    </Box>
  );
}

function RekognitionResultsDialog({ onClose, record }) {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(true);
  const images = record.getCellValue("Images");

  useEffect(() => {
    processImage(images[0]).then((results) => {
      console.log(results);
      setResults(results);
      setLoading(false);
    });
  }, []);

  return (
    <Dialog onClose={onClose} width="320px">
      <Heading variant="caps">Image Analysis Results</Heading>
      {loading ? (
        <div style={{ display: "flex" }}>
          <Text size="large" style={{ marginRight: "5px" }}>
            Running image analysis..
          </Text>{" "}
          <Loader />
        </div>
      ) : (
        <section>
          <Box style={{ marginBottom: 15 }}>
            <Heading size="small">🌟 Celebrities Recognised</Heading>
            {results.celebrity ? (
              <React.Fragment>
                <Label label={"Name"} value={results.celebrity.Name} />
                <Label
                  label={"Confidence"}
                  value={results.celebrity.MatchConfidence}
                />
              </React.Fragment>
            ) : (
              <Text size="large">No Celebrity Recognised.</Text>
            )}
          </Box>

          <Box style={{ marginBottom: 15 }}>
             <Heading size="small">🔬 Object Detection</Heading>
           {results.labels.map((label) => {
              return (
                <span key={label.Name}>
                  <Label label={"Name"} value={label.Name} />
                  <Label
                    label={"Confidence"}
                    value={label.Confidence.toFixed(2)}
                  />
                  <hr />
                </span>
              );
            })}
          </Box>

          <Box style={{ marginBottom: 15 }}>
            <Heading size="small">🚫 NSFW Detection</Heading>
            {results.nsfwLabels.map((label) => {
              return (
                <span key={label.Name}>
                  <Label label={"Name"} value={label.Name} />
                  <Label
                    label={"Confidence"}
                    value={label.Confidence.toFixed(2)}
                  />
                  <hr />
                </span>
              );
            })}
          </Box>
          <Dialog.CloseButton />
          <Button onClick={onClose}>Close</Button>
        </section>
      )}
    </Dialog>
  );
}

function Label({ label, value }) {
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: 5 }}>
      <Heading variant="caps" size="xsmall" style={{ margin: "0 10px 0 0" }}>
        {label}:
      </Heading>
      <Text size="large">{value}</Text>
    </div>
  );
}

initializeBlock(() => <ObjectDetectionBlock />);
