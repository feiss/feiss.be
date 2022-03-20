<?php
header("Content-type: application/txt");
header("Content-Disposition: inline;filename=posts_blogger.sql;");

$file= "blog.xml";

$xml = new XMLReader(); 
$xml->open($file);
$assoc = xml2assoc($xml);
$xml->close();

//print_r($assoc);
$relevant= array();
$postid= 0;
getRelevantData($assoc);

//$max = number of post to retrieve (comments are considered posts)

$max= count($relevant);
echo "INSERT INTO `posts` (  `id` ,  `title` ,  `text` ,  `date` ,  `show` ) \nVALUES\n";
for ($i=0; $i< $max; $i++)
{
	if (!$relevant[$i]["content"]) continue;
	$date= getTimestamp($relevant[$i]["published"]);
	echo "(NULL, ";
	echo """.addslashes($relevant[$i]["title"])."", ";
	echo """.addslashes($relevant[$i]["content"])."", ";
	echo """.$date."", "1")";
	if ($i< $max-1) echo ",\n"; else echo ";";
}

////////////////////////////////////////////////////
////////////////////////////////////////////////////

function getTimestamp($date)
{
	preg_match("/(\d\d\d\d)-(\d\d)-(\d\d)T(\d\d):(\d\d)/", $date, $m);
	return gmmktime($m[4], $m[5], 0, $m[2], $m[3], $m[1]);
}


function getRelevantData($assoc, &$rkey=0, &$rvalue=0)
{
	global $relevant;
	global $postid;

	foreach($assoc as $key=>$value)
	{
		if ($key && $key!="0" && $key!="value" && $key!="updated" 
		&& $key!="name" && $key!="author" && $key!="email" && $key!="uri"
		 && $key!="uri") $rkey= $key;
		
		if (is_array($value))
		{
			getRelevantData($value, $rkey, $rvalue);
		}
		else if (trim($value) && $rkey) 
		{
			$rvalue= str_replace("\r", "", str_replace("\n", "", $value));
			$rvalue= ereg_replace(" +", " ", $rvalue);
			if (!$relevant[$postid][$rkey])	$relevant[$postid][$rkey]= $rvalue;
			if ($rkey=="id") $postid++;
		}
	}
	
}

//from php.net
function xml2assoc($xml) {
  $assoc = null;
  while($xml->read()){
    switch ($xml->nodeType) {
      case XMLReader::END_ELEMENT: return $assoc;
      case XMLReader::ELEMENT:
		if ($xml->isEmptyElement) break;
        $assoc[$xml->name][] = array("value" => xml2assoc($xml));
	    break;
      case XMLReader::TEXT:
      case XMLReader::CDATA: $assoc .= $xml->value;
    }
  }
  return $assoc;
}
?>