from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from collections import defaultdict

import json
import pandas
import numpy
import csv


def getRelatedSymptoms(symptom=None):
    with open('threads/diabetes_30pages.json', 'r') as f:
         data = json.load(f)
         # print (data)

    with open('threads/diabetes_replies.json', 'r') as f1:
        replies = json.load(f1)

    file = open("myfile.txt", "w")
    reply = ""
    datastring = ""
    replyText = " "
    for i in range (0, len(data)):
        try:
            # print(data[i]['symptom'])
            datastring = (str(data[i]['title']).strip("[]").strip("''") +" "+ str(data[i]['tags']).strip("[]").strip("''")+ " " +str(data[i]['threadBody']).strip("[]").strip("''"))
            id = str(data[i]['title']).strip("[]").strip("''")

            for j in range (0, len(replies)):
                try:
                    reply = (str(replies[j]['threadId']).strip("[]").strip("''") )

                    # print (reply)
                    # print (id)
                    if  reply == id:
                          replyText = replyText + " " + (str(replies[j]['replyText']).strip("[]").strip("''"))
                except:
                    continue

            file.write(datastring + "" + replyText + "\n")
            # print( datastring + "" + replyText)

        except:
            continue

    symptomFile = open("threads/symptoms.txt")
    lines = symptomFile.readlines()
    syms = []
    for line in lines:
        syms.append(line[:-1])
        # for word in line.split():
        #     syms.append(word)

    # print(syms)

    length= len(syms)
    fh = open("myfile.txt")
    lines = fh.readlines()
    # print(lines)
    finalCount = list()
    for i in range(0,len(syms)):
        count = list()
        for j in range(0, len(lines)):
            if syms[i] in lines[j]:
                count.append(1)
            else:
                count.append(0)
        finalCount.append(count)

    symEnc = numpy.array(finalCount)
    # print(symEnc)
    encSym = numpy.transpose(symEnc)

    symSym = numpy.matmul(symEnc,encSym)
    # print(symSym)

    I = pandas.Index(syms, name="rows")
    C = pandas.Index(syms, name="columns")

    file1 = open("output.txt", "w")
    df = pandas.DataFrame(symSym,index=I, columns=C)
    for i in range(0, length):
        df = df.sort_values(by = syms[i], axis=1,ascending= False)
        file1.write(syms[i] + str(df.columns.values.tolist()) + "\n")
    df.to_csv("symSym.csv")
    with open('symSym.csv') as csv_file:
        csv_reader = csv.reader(csv_file, delimiter=',')
        allSymptoms = []
        relatedSymptoms = []
        for i1, row in enumerate(csv_reader):
            if symptom is None:
                return row[1:]

            if i1 == 0:
                allSymptoms = row
            if row[0] == symptom:
                for i2, r in enumerate(row):
                    if r != '0' and i2 != 0:
                        relatedSymptoms.append(allSymptoms[i2])
        return relatedSymptoms


class GetThreads(APIView):
    def post(self, request, format=None):
        querySymptom    = request.data.get('symptom')


        relatedSymptoms = getRelatedSymptoms(querySymptom)

        if querySymptom is "":
            relatedSymptoms = getRelatedSymptoms()

        data = {
            "related_symptoms": relatedSymptoms
        }

        if querySymptom not in relatedSymptoms:
            relatedSymptoms.insert(0, querySymptom)

        # parse the diabetes_threads.json
        f1 = open('threads/threadsRepliesMerged.json')

        threadsData = json.load(f1)

        # return all threads
        # if querySymptom is None:
        #     return Response(symptomsData, status=status.HTTP_200_OK)

        repliesDict = defaultdict(list)
        threads     = defaultdict(list)

        data["threads"] = {}
        for relatedSymptom in relatedSymptoms:
            data["threads"][relatedSymptom] = []
            for l1 in threadsData:
                if relatedSymptom in l1["title"] or relatedSymptom in l1["body"]:
                    data["threads"][relatedSymptom].append(l1)
                else:
                    for text in l1["replies"]:
                        if relatedSymptom in text:
                            data["threads"][relatedSymptom].append(l1)
                            break

        return Response(data, status=status.HTTP_200_OK)
